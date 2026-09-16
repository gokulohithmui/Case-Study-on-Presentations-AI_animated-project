import os
import subprocess
import json
import glob
from pathlib import Path

def run_synthea(num_patients=5):
    """Clones Synthea if necessary and runs the generator."""
    if not os.path.exists("synthea"):
        print("Cloning Synthea...")
        subprocess.run(["git", "clone", "https://github.com/synthetichealth/synthea.git"])
    
    print(f"Running Synthea to generate {num_patients} patients...")
    # On Windows it might be run_synthea.bat, on unix ./run_synthea
    script = "run_synthea.bat" if os.name == 'nt' else "./run_synthea"
    subprocess.run([script, "-p", str(num_patients)], cwd="synthea", shell=(os.name == 'nt'))

def convert_to_schema():
    """Parses Synthea FHIR JSON and converts it to our CDSS case schema."""
    output_dir = Path("synthea/output/fhir")
    if not output_dir.exists():
        print("No FHIR output found. Did Synthea run correctly?")
        return

    cases = []
    for filepath in glob.glob(f"{output_dir}/*.json"):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        if "entry" not in data:
            continue
            
        case = {
            "patient_id": None,
            "demographics": {},
            "conditions": [],
            "medications": [],
            "encounters": [],
            "data_provenance": "synthea"
        }
        
        for entry in data.get("entry", []):
            resource = entry.get("resource", {})
            rtype = resource.get("resourceType")
            
            if rtype == "Patient":
                case["patient_id"] = resource.get("id")
                case["demographics"]["gender"] = resource.get("gender")
                case["demographics"]["birthDate"] = resource.get("birthDate")
            elif rtype == "Condition":
                code_text = resource.get("code", {}).get("text", "Unknown Condition")
                case["conditions"].append(code_text)
            elif rtype == "MedicationRequest":
                med_text = resource.get("medicationCodeableConcept", {}).get("text", "Unknown Med")
                case["medications"].append(med_text)
            elif rtype == "Encounter":
                reason = resource.get("reasonCode", [{}])[0].get("text", "Unknown Reason")
                case["encounters"].append(reason)
                
        # Only add valid patients
        if case["patient_id"]:
            cases.append(case)
            
    os.makedirs("data", exist_ok=True)
    with open("data/synthetic_cases.json", "w", encoding="utf-8") as f:
        json.dump(cases, f, indent=2)
    print(f"Converted {len(cases)} Synthea cases to schema and saved to data/synthetic_cases.json")

if __name__ == "__main__":
    run_synthea(5)
    convert_to_schema()
