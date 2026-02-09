"""
FastAPI routes for OMOP Standard CDM data
"""
from typing import Any, Optional
from datetime import date
from fastapi import APIRouter, HTTPException, Query

from app.api.deps import PatientsSessionDep, CurrentUser
from app.models.omop import (
    PersonPublic,
    ConditionOccurrencePublic,
    MeasurementPublic,
    ObservationPublic,
    DrugExposurePublic,
    VisitOccurrencePublic,
    ProcedureOccurrencePublic,
)
from app.crud_omop import (
    PersonCRUD,
    ConditionOccurrenceCRUD,
    MeasurementCRUD,
    ObservationCRUD,
    DrugExposureCRUD,
    VisitOccurrenceCRUD,
    ProcedureOccurrenceCRUD,
    ConceptCRUD,
)
from app.omop_utils.concept_mapper import ConceptMapper

router = APIRouter(prefix="/omop", tags=["omop"])


# Person endpoints
@router.get("/persons/{person_id}")
def get_person(
    person_id: int, current_user: CurrentUser, session: PatientsSessionDep
) -> Any:
    """Get a specific person's demographics with concept names"""
    person = PersonCRUD.get_person(session=session, person_id=person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    mapper = ConceptMapper(session)
    return {
        **PersonPublic.model_validate(person).model_dump(),
        "gender_name": mapper.get_concept_name(person.gender_concept_id),
        "race_name": mapper.get_concept_name(person.race_concept_id),
        "ethnicity_name": mapper.get_concept_name(person.ethnicity_concept_id),
    }


@router.get("/persons")
def list_persons(
    current_user: CurrentUser,
    session: PatientsSessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    q: Optional[str] = Query(None, min_length=1, max_length=255, description="Search by person ID or source values"),
) -> Any:
    """Get paginated list of persons with optional search"""
    total = PersonCRUD.count_persons(session=session, search=q)
    persons = PersonCRUD.get_persons(session=session, skip=skip, limit=limit, search=q)
    
    mapper = ConceptMapper(session)
    return {
        "data": [
            {
                **PersonPublic.model_validate(p).model_dump(),
                "gender_name": mapper.get_concept_name(p.gender_concept_id),
                "race_name": mapper.get_concept_name(p.race_concept_id),
                "ethnicity_name": mapper.get_concept_name(p.ethnicity_concept_id),
            }
            for p in persons
        ],
        "count": total,
        "skip": skip,
        "limit": limit,
        "query": q,
    }


# Condition endpoints
@router.get("/persons/{person_id}/conditions")
def get_person_conditions(
    person_id: int,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Get all conditions for a person"""
    # Verify person exists
    person = PersonCRUD.get_person(session=session, person_id=person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    total = ConditionOccurrenceCRUD.count_conditions_for_person(
        session=session, person_id=person_id
    )
    conditions = ConditionOccurrenceCRUD.get_conditions_for_person(
        session=session, person_id=person_id, skip=skip, limit=limit
    )
    
    mapper = ConceptMapper(session)
    return {
        "data": [
            {
                **ConditionOccurrencePublic.model_validate(c).model_dump(),
                "condition_name": mapper.get_concept_name(c.condition_concept_id),
            }
            for c in conditions
        ],
        "count": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/conditions/{condition_id}", response_model=ConditionOccurrencePublic)
def get_condition(
    condition_id: int, current_user: CurrentUser, session: PatientsSessionDep
) -> Any:
    """Get a specific condition occurrence"""
    condition = ConditionOccurrenceCRUD.get_condition(
        session=session, condition_id=condition_id
    )
    if not condition:
        raise HTTPException(status_code=404, detail="Condition not found")
    return condition


# Measurement endpoints
@router.get("/persons/{person_id}/measurements")
def get_person_measurements(
    person_id: int,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Get all measurements for a person"""
    # Verify person exists
    person = PersonCRUD.get_person(session=session, person_id=person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    total = MeasurementCRUD.count_measurements_for_person(
        session=session, person_id=person_id
    )
    measurements = MeasurementCRUD.get_measurements_for_person(
        session=session, person_id=person_id, skip=skip, limit=limit
    )
    
    mapper = ConceptMapper(session)
    return {
        "data": [
            {
                **MeasurementPublic.model_validate(m).model_dump(),
                "measurement_name": mapper.get_concept_name(m.measurement_concept_id),
                "unit_name": mapper.get_concept_name(m.unit_concept_id)
                if m.unit_concept_id
                else None,
            }
            for m in measurements
        ],
        "count": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/measurements/{measurement_id}", response_model=MeasurementPublic)
def get_measurement(
    measurement_id: int, current_user: CurrentUser, session: PatientsSessionDep
) -> Any:
    """Get a specific measurement"""
    measurement = MeasurementCRUD.get_measurement(
        session=session, measurement_id=measurement_id
    )
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
    return measurement


@router.get("/measurements/concept/{concept_id}")
def get_measurements_by_concept(
    concept_id: int,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Get measurements for a specific concept with optional date range"""
    measurements = MeasurementCRUD.get_measurements_by_concept(
        session=session,
        concept_id=concept_id,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )
    
    mapper = ConceptMapper(session)
    concept = mapper.get_concept(concept_id)
    
    return {
        "concept_id": concept_id,
        "concept_name": concept.concept_name if concept else "Unknown",
        "data": [
            {
                **MeasurementPublic.model_validate(m).model_dump(),
                "unit_name": mapper.get_concept_name(m.unit_concept_id)
                if m.unit_concept_id
                else None,
            }
            for m in measurements
        ],
        "count": len(measurements),
    }


# Drug exposure endpoints
@router.get("/persons/{person_id}/medications")
def get_person_medications(
    person_id: int,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Get all drug exposures for a person"""
    # Verify person exists
    person = PersonCRUD.get_person(session=session, person_id=person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    total = DrugExposureCRUD.count_drug_exposures_for_person(
        session=session, person_id=person_id
    )
    medications = DrugExposureCRUD.get_drug_exposures_for_person(
        session=session, person_id=person_id, skip=skip, limit=limit
    )
    
    mapper = ConceptMapper(session)
    return {
        "data": [
            {
                **DrugExposurePublic.model_validate(m).model_dump(),
                "drug_name": mapper.get_concept_name(m.drug_concept_id),
            }
            for m in medications
        ],
        "count": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/persons/{person_id}/medications/active")
def get_active_medications(
    person_id: int, current_user: CurrentUser, session: PatientsSessionDep
) -> Any:
    """Get currently active medications for a person"""
    # Verify person exists
    person = PersonCRUD.get_person(session=session, person_id=person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    medications = DrugExposureCRUD.get_active_medications(
        session=session, person_id=person_id
    )
    
    mapper = ConceptMapper(session)
    return {
        "data": [
            {
                **DrugExposurePublic.model_validate(m).model_dump(),
                "drug_name": mapper.get_concept_name(m.drug_concept_id),
            }
            for m in medications
        ],
        "count": len(medications),
    }


# Visit endpoints
@router.get("/persons/{person_id}/visits")
def get_person_visits(
    person_id: int,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Get all visits for a person"""
    # Verify person exists
    person = PersonCRUD.get_person(session=session, person_id=person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    total = VisitOccurrenceCRUD.count_visits_for_person(
        session=session, person_id=person_id
    )
    visits = VisitOccurrenceCRUD.get_visits_for_person(
        session=session, person_id=person_id, skip=skip, limit=limit
    )
    
    mapper = ConceptMapper(session)
    return {
        "data": [
            {
                **VisitOccurrencePublic.model_validate(v).model_dump(),
                "visit_type_name": mapper.get_concept_name(v.visit_concept_id),
            }
            for v in visits
        ],
        "count": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/visits/{visit_id}", response_model=VisitOccurrencePublic)
def get_visit(visit_id: int, current_user: CurrentUser, session: PatientsSessionDep) -> Any:
    """Get a specific visit"""
    visit = VisitOccurrenceCRUD.get_visit(session=session, visit_id=visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit


# Observation endpoints
@router.get("/persons/{person_id}/observations")
def get_person_observations(
    person_id: int,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Get all observations for a person"""
    # Verify person exists
    person = PersonCRUD.get_person(session=session, person_id=person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    observations = ObservationCRUD.get_observations_for_person(
        session=session, person_id=person_id, skip=skip, limit=limit
    )
    
    mapper = ConceptMapper(session)
    return {
        "data": [
            {
                **ObservationPublic.model_validate(o).model_dump(),
                "observation_name": mapper.get_concept_name(o.observation_concept_id),
            }
            for o in observations
        ],
        "count": len(observations),
        "skip": skip,
        "limit": limit,
    }


# Procedure endpoints
@router.get("/persons/{person_id}/procedures")
def get_person_procedures(
    person_id: int,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Get all procedures for a person"""
    # Verify person exists
    person = PersonCRUD.get_person(session=session, person_id=person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    procedures = ProcedureOccurrenceCRUD.get_procedures_for_person(
        session=session, person_id=person_id, skip=skip, limit=limit
    )
    
    mapper = ConceptMapper(session)
    return {
        "data": [
            {
                **ProcedureOccurrencePublic.model_validate(p).model_dump(),
                "procedure_name": mapper.get_concept_name(p.procedure_concept_id),
            }
            for p in procedures
        ],
        "count": len(procedures),
        "skip": skip,
        "limit": limit,
    }


# Concept lookup endpoints
@router.get("/concepts/search")
def search_concepts(
    q: str = Query(..., min_length=1, max_length=255),
    current_user: CurrentUser = None,
    session: PatientsSessionDep = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
) -> Any:
    """Search for concepts by name"""
    concepts = ConceptCRUD.search_concepts(
        session=session, search_term=q, skip=skip, limit=limit
    )
    
    return {
        "query": q,
        "data": [
            {
                "concept_id": c.concept_id,
                "concept_name": c.concept_name,
                "vocabulary_id": c.vocabulary_id,
                "concept_code": c.concept_code,
            }
            for c in concepts
        ],
        "count": len(concepts),
    }


@router.get("/concepts/domain/{domain_id}")
def get_concepts_by_domain(
    domain_id: str,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Get all concepts for a specific domain"""
    concepts = ConceptCRUD.get_concepts_by_domain(
        session=session, domain_id=domain_id, skip=skip, limit=limit
    )
    
    return {
        "domain_id": domain_id,
        "data": [
            {
                "concept_id": c.concept_id,
                "concept_name": c.concept_name,
                "vocabulary_id": c.vocabulary_id,
            }
            for c in concepts
        ],
        "count": len(concepts),
    }


@router.get("/concepts/{concept_id}")
def get_concept(
    concept_id: int, current_user: CurrentUser, session: PatientsSessionDep
) -> Any:
    """Get concept details by ID"""
    concept = ConceptCRUD.get_concept(session=session, concept_id=concept_id)
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    return {
        "concept_id": concept.concept_id,
        "concept_name": concept.concept_name,
        "domain_id": concept.domain_id,
        "vocabulary_id": concept.vocabulary_id,
        "concept_class_id": concept.concept_class_id,
        "concept_code": concept.concept_code,
    }
