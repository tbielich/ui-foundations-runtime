"""Read-only evidence comparison; writes only its bounded verification result."""
import json
from pathlib import Path
root = Path(__file__).resolve().parent
baseline = json.loads((root / "baseline-consumer.json").read_text())
final = json.loads((root / "final-consumer.json").read_text())
old_docs = json.loads((root / "baseline-docs.json").read_text())
new_docs = json.loads((root / "final-docs.json").read_text())
result = {"consumer_bc_differences": [], "token_bc_differences": [], "docs_bc_differences": [], "a_policy_failures": [], "preserved_prose_failures": [], "icon_geometry_failures": [], "unexpected_missing_cases": []}
identity = lambda r: (r["host"], r["brand"], r["mode"])
after = {identity(r): r for r in final["rows"]}
targets = ["button", "composedButton", "buttonText", "fieldLabel", "fieldLabelText", "inputWrapper", "input", "badge", "badgeText", "link", "illustratedAction", "alertAction"]
for before in baseline["rows"]:
    key = identity(before)
    if key not in after:
        result["unexpected_missing_cases"].append(key)
        continue
    now = after[key]
    if before["brand"] in ("b", "c"):
        for role, metrics in before["metrics"].items():
            for prop, value in metrics.items():
                actual = now["metrics"].get(role, {}).get(prop)
                if value != actual:
                    result["consumer_bc_differences"].append({"case":key, "role":role, "property":prop, "before":value, "after":actual})
        for name, value in before["tokens"].items():
            actual = now["tokens"].get(name)
            if value != actual:
                result["token_bc_differences"].append({"case":key, "token":name, "before":value, "after":actual})
    else:
        for role in targets:
            actual = now["metrics"].get(role, {})
            if actual.get("family") != "Inter" or actual.get("weight") != "600":
                result["a_policy_failures"].append({"case":key, "role":role, "expected":"Inter 600", "actual":actual})
        for role in ["heading", "illustratedHeading"]:
            actual = now["metrics"].get(role, {})
            if actual.get("family", "").strip('"') != "Roboto Slab" or actual.get("weight") != "700":
                result["a_policy_failures"].append({"case":key, "role":role, "expected":"Roboto Slab 700", "actual":actual})
        for role in ["body", "helper", "illustratedDescription", "alertDescription", "select", "option", "textarea", "progressLabel", "progressValue"]:
            for prop in ["family", "weight", "size", "line"]:
                if before["metrics"][role][prop] != now["metrics"][role][prop]:
                    result["preserved_prose_failures"].append({"case":key, "role":role, "property":prop, "before":before["metrics"][role][prop], "after":now["metrics"][role][prop]})
        if now["metrics"]["required"]["weight"] != "700":
            result["a_policy_failures"].append({"case":key, "role":"required", "expectedWeight":"700", "actual":now["metrics"]["required"]})
        for role in ["inputClear", "inputIcon"]:
            for prop in ["size", "line", "width", "height"]:
                if before["metrics"][role][prop] != now["metrics"][role][prop]:
                    result["icon_geometry_failures"].append({"case":key, "role":role, "property":prop, "before":before["metrics"][role][prop], "after":now["metrics"][role][prop]})
new_by_key = {(r["slug"],r["brand"],r["mode"]):r for r in new_docs["rows"]}
for before in old_docs["rows"]:
    if before["brand"] not in ("b","c"):
        continue
    key = (before["slug"],before["brand"],before["mode"])
    now = new_by_key.get(key)
    if now is None:
        result["unexpected_missing_cases"].append(key)
    elif before["metrics"] != now["metrics"]:
        result["docs_bc_differences"].append({"case":key,"before":before["metrics"],"after":now["metrics"]})
result["summary"] = {key:len(value) for key,value in result.items()}
result["gate"] = "PASS" if all(not value for value in result.values() if isinstance(value,list)) else "FAIL"
(root / "comparison.json").write_text(json.dumps(result,indent=2))
print(json.dumps({"gate":result["gate"],**result["summary"]},indent=2))
