from typing import Any
from fastapi import APIRouter, HTTPException
from app.api.deps import (
    PatientsSessionDep,
    CurrentUser,
    SessionDep,
)
from app.models.patient import (
    PatientPublic,
    PatientsPublic,
    FullPatientProfile,
    VisitInfo,
    BP,
    Demographics,
    ADI,
    HeightWeight,
    Labs,
    CKDData,
)
from app.models.patient_uuid import PatientUUIDMap
from sqlmodel import func, select

router = APIRouter(prefix="/patients", tags=["patients"])


def _get_or_create_patient_uuid(
    session: SessionDep, patient_deiden_id: str
) -> str:
    mapping = session.exec(
        select(PatientUUIDMap).where(
            PatientUUIDMap.patient_deiden_id == patient_deiden_id
        )
    ).first()
    if mapping:
        return mapping.id
    
    # Create new mapping with UUID
    new_mapping = PatientUUIDMap(patient_deiden_id=patient_deiden_id)
    session.add(new_mapping)
    session.commit()
    session.refresh(new_mapping)
    return new_mapping.id


@router.get("/", response_model=PatientsPublic)
def read_patients(
    current_user: CurrentUser,
    session: PatientsSessionDep,
    app_session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve patients from the patients database.
    """
    count_statement = select(func.count()).select_from(Demographics)
    count = session.exec(count_statement).one()

    statement = select(Demographics).offset(skip).limit(limit)
    demographics_rows = session.exec(statement).all()

    patients = [
        PatientPublic(
            patient_deiden_id=row.patient_deiden_id,
            date_of_birth=row.deid_date_of_birth,
            gender=row.sex,
            race=row.race,
            ethnicity=row.ethnicity,
            last_weight=None,
            last_height=None,
            id=_get_or_create_patient_uuid(app_session, row.patient_deiden_id),
        )
        for row in demographics_rows
    ]

    return PatientsPublic(data=patients, count=count)


@router.get("/by-uuid/{patient_uuid}", response_model=FullPatientProfile)
def read_patient_by_uuid(
    patient_uuid: str,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    app_session: SessionDep,
) -> Any:
    """
    Retrieve a complete patient profile by UUID.
    """
    mapping = app_session.exec(
        select(PatientUUIDMap).where(PatientUUIDMap.id == patient_uuid)
    ).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Patient not found")
    return _read_patient_profile(
        patient_deiden_id=mapping.patient_deiden_id,
        session=session,
        app_session=app_session,
    )


@router.get("/{patient_id}", response_model=FullPatientProfile)
def read_patient(
    patient_id: str,
    current_user: CurrentUser,
    session: PatientsSessionDep,
    app_session: SessionDep,
) -> Any:
    """
    Retrieve a complete patient profile including all related health data.
    Accepts either patient_deiden_id or patient UUID.
    """
    patient_ref_id = patient_id
    # Try to look up by UUID first
    mapping = app_session.exec(
        select(PatientUUIDMap).where(PatientUUIDMap.id == patient_id)
    ).first()
    if mapping:
        patient_ref_id = mapping.patient_deiden_id

    return _read_patient_profile(
        patient_deiden_id=patient_ref_id,
        session=session,
        app_session=app_session,
    )


def _read_patient_profile(
    patient_deiden_id: str,
    session: PatientsSessionDep,
    app_session: SessionDep,
) -> FullPatientProfile:
    # Get demographics as base record
    demographics = session.exec(
        select(Demographics).where(
            Demographics.patient_deiden_id == patient_deiden_id
        )
    ).first()

    if not demographics:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient_ref_id = demographics.patient_deiden_id

    patient_uuid = _get_or_create_patient_uuid(
        app_session, demographics.patient_deiden_id
    )

    patient = PatientPublic(
        patient_deiden_id=patient_ref_id,
        date_of_birth=demographics.deid_date_of_birth,
        sex=demographics.sex,
        race=demographics.race,
        ethnicity=demographics.ethnicity,
        id=patient_uuid,
    )

    # Get BP records
    bp_records = session.exec(
        select(BP).where(BP.patient_deiden_id == patient_ref_id)
    ).all()

    # Get ADI records and sort by deid_contact_date
    adi_records = session.exec(
        select(ADI).where(ADI.patient_deiden_id == patient_ref_id)
    ).all()
    adi_records = sorted(adi_records, key=lambda x: x.deid_contact_date or datetime.min.date())

    # Get lab records
    lab_records = session.exec(
        select(Labs).where(Labs.patient_deiden_id == patient_ref_id)
    ).all()

    # Get CKD data records
    ckd_records = session.exec(
        select(CKDData).where(CKDData.patient_deiden_id == patient_ref_id)
    ).all()

    # Calculate visit information from ADI records
    visit_dates = [adi.deid_contact_date for adi in adi_records if adi.deid_contact_date]
    first_visit_date = min(visit_dates) if visit_dates else None
    last_visit_date = max(visit_dates) if visit_dates else None
    tracking_period_days = (last_visit_date - first_visit_date).days if first_visit_date and last_visit_date else None
    
    # Count unique encounters from ADI records
    unique_encounters = set(adi.encounter_deiden_id for adi in adi_records if adi.encounter_deiden_id)
    number_of_encounters = len(unique_encounters)
    
    visit_info = VisitInfo(
        number_of_visits=len(adi_records),
        number_of_encounters=number_of_encounters,
        first_visit_date=first_visit_date,
        last_visit_date=last_visit_date,
        tracking_period_days=tracking_period_days,
    )

    return FullPatientProfile(
        patient=patient,
        visit_info=visit_info,
        demographics=demographics,
        bp_records=bp_records,
        adi_records=adi_records,
        lab_records=lab_records,
        ckd_data_records=ckd_records,
    )
