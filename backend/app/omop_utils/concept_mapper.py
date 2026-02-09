"""
OMOP Concept Mapping Utility
Maps concept IDs (numbers) to human-readable values and descriptions
"""
from typing import Optional, Dict, List
from sqlmodel import Session, select
from app.models.omop import Concept


class ConceptMapper:
    """Utility class for mapping OMOP concept IDs to human-readable values"""
    
    def __init__(self, session: Session):
        self.session = session
        self._concept_cache: Dict[int, Concept] = {}
    
    def get_concept(self, concept_id: int) -> Optional[Concept]:
        """
        Get a concept by ID with caching to improve performance.
        
        Args:
            concept_id: The OMOP concept ID
            
        Returns:
            Concept object or None if not found
        """
        # Check cache first
        if concept_id in self._concept_cache:
            return self._concept_cache[concept_id]
        
        # Query database
        statement = select(Concept).where(Concept.concept_id == concept_id)
        concept = self.session.exec(statement).first()
        
        # Cache the result
        if concept:
            self._concept_cache[concept_id] = concept
        
        return concept
    
    def get_concept_name(self, concept_id: int) -> str:
        """
        Get human-readable name for a concept ID.
        
        Args:
            concept_id: The OMOP concept ID
            
        Returns:
            Concept name or "Unknown (ID: {concept_id})" if not found
        """
        concept = self.get_concept(concept_id)
        if concept:
            return concept.concept_name
        standard_name = _get_standard_concept_name(concept_id)
        if standard_name:
            return standard_name
        return f"Unknown (ID: {concept_id})"
    
    def get_concepts_by_ids(self, concept_ids: List[int]) -> Dict[int, str]:
        """
        Get a mapping of concept IDs to names.
        
        Args:
            concept_ids: List of OMOP concept IDs
            
        Returns:
            Dictionary mapping concept_id -> concept_name
        """
        result = {}
        uncached_ids = []
        
        # Check cache first
        for cid in concept_ids:
            if cid in self._concept_cache:
                result[cid] = self._concept_cache[cid].concept_name
            else:
                uncached_ids.append(cid)
        
        # Query for uncached concepts
        if uncached_ids:
            statement = select(Concept).where(Concept.concept_id.in_(uncached_ids))
            concepts = self.session.exec(statement).all()
            
            for concept in concepts:
                result[concept.concept_id] = concept.concept_name
                self._concept_cache[concept.concept_id] = concept
            
            # Add unknown concepts
            for cid in uncached_ids:
                if cid not in result:
                    result[cid] = f"Unknown (ID: {cid})"
        
        return result
    
    def get_concepts_by_domain(self, domain_id: str) -> Dict[int, str]:
        """
        Get all concepts in a specific domain.
        
        Args:
            domain_id: OMOP domain ID (e.g., 'Condition', 'Drug', 'Procedure')
            
        Returns:
            Dictionary mapping concept_id -> concept_name
        """
        statement = select(Concept).where(Concept.domain_id == domain_id)
        concepts = self.session.exec(statement).all()
        
        result = {}
        for concept in concepts:
            result[concept.concept_id] = concept.concept_name
            self._concept_cache[concept.concept_id] = concept
        
        return result
    
    def get_concepts_by_vocabulary(self, vocabulary_id: str) -> Dict[int, str]:
        """
        Get all concepts from a specific vocabulary.
        
        Args:
            vocabulary_id: OMOP vocabulary ID (e.g., 'SNOMED', 'ICD10')
            
        Returns:
            Dictionary mapping concept_id -> concept_name
        """
        statement = select(Concept).where(Concept.vocabulary_id == vocabulary_id)
        concepts = self.session.exec(statement).all()
        
        result = {}
        for concept in concepts:
            result[concept.concept_id] = concept.concept_name
            self._concept_cache[concept.concept_id] = concept
        
        return result
    
    def clear_cache(self):
        """Clear the concept cache"""
        self._concept_cache.clear()


# Common OMOP concept domains and their IDs
OMOP_DOMAINS = {
    "Condition": "Condition",
    "Drug": "Drug",
    "Procedure": "Procedure",
    "Measurement": "Measurement",
    "Observation": "Observation",
    "Visit": "Visit",
    "Device": "Device",
    "Gender": "Gender",
    "Race": "Race",
    "Ethnicity": "Ethnicity",
    "Type Concept": "Type Concept",
}

# Common standard OMOP concepts for demographics
STANDARD_CONCEPTS = {
    "GENDER": {
        8507: "Male",
        8532: "Female",
        8521: "Unknown",
    },
    "RACE": {
        8516: "White",
        8517: "Black or African American",
        8515: "Asian",
        8557: "Native Hawaiian or other Pacific Islander",
        8657: "Native American",
        38003598: "Other Race",
    },
    "ETHNICITY": {
        38003563: "Hispanic",
        38003564: "Non-Hispanic",
        0: "Unknown",
    },
}


def _get_standard_concept_name(concept_id: int) -> Optional[str]:
    """Lookup concept name from standard demographic mappings."""
    for category in STANDARD_CONCEPTS.values():
        if concept_id in category:
            return category[concept_id]
    return None


def get_gender_name(gender_concept_id: int) -> str:
    """Get human-readable gender from concept ID"""
    return STANDARD_CONCEPTS["GENDER"].get(gender_concept_id, f"Unknown ({gender_concept_id})")


def get_race_name(race_concept_id: int) -> str:
    """Get human-readable race from concept ID"""
    return STANDARD_CONCEPTS["RACE"].get(race_concept_id, f"Unknown ({race_concept_id})")


def get_ethnicity_name(ethnicity_concept_id: int) -> str:
    """Get human-readable ethnicity from concept ID"""
    return STANDARD_CONCEPTS["ETHNICITY"].get(ethnicity_concept_id, f"Unknown ({ethnicity_concept_id})")
