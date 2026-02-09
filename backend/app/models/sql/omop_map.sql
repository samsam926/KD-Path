------------------------
-- OMOP Mapping Tables
------------------------
-- Schema: omop_maps
CREATE SCHEMA IF NOT EXISTS omop_maps;
--- Create a mapping table for person identifiers from various source systems
CREATE TABLE IF NOT EXISTS omop_maps.person_map (
    person_id            INTEGER PRIMARY KEY,
    source_system        TEXT NOT NULL,         -- 'UF', 'IU', etc.
    person_source_value  TEXT NOT NULL,         -- PATIENT_12345
    UNIQUE (source_system, person_source_value)
);

--Create schema for storing omop lab unit mappings
CREATE TABLE omop_maps.labs_unit_map (
    source_code TEXT PRIMARY KEY,
    target_concept_id INT,
    target_description TEXT,
    target_vocab TEXT
);

-- Create a LOINC mapping table
CREATE TABLE IF NOT EXISTS omop_maps.loinc_map (
    source_concept_id VARCHAR(50) PRIMARY KEY,   -- LOINC code from source data
    target_concept_id INTEGER,                   -- OMOP standard concept_id
    target_name TEXT                             -- Optional descriptive name
);

--- Create a mapping table for lab names to LOINC codes
CREATE TABLE IF NOT EXISTS omop_maps.source_lab_name_loinc_map
(
    lab_name text COLLATE pg_catalog."default" NOT NULL,
    loinc_code character varying COLLATE pg_catalog."default",
    CONSTRAINT source_lab_name_loinc_map_pkey PRIMARY KEY (lab_name)
)

-- Create encounter to visit_occurrence mapping table
CREATE TABLE IF NOT EXISTS omop_maps.encounter_visit_id_map (
    encounter_deiden_id VARCHAR NOT NULL,
    visit_occurrence_id INTEGER NOT NULL,
    source_system VARCHAR NOT NULL,
    CONSTRAINT pk_encounter_visit_map PRIMARY KEY (encounter_deiden_id, source_system)
);

