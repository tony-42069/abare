from bson import ObjectId
from typing import Any, Dict, List, Optional, Annotated
from pydantic import BeforeValidator

# Define a custom type for handling MongoDB ObjectIds with Pydantic V2
def validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str):
        return v
    raise TypeError("ObjectId required")

PydanticObjectId = Annotated[str, BeforeValidator(validate_object_id)]

def serialize_object_id(obj: Dict[str, Any]) -> Dict[str, Any]:
    """Convert all ObjectId instances to strings in a dict."""
    result = {}
    for k, v in obj.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, dict):
            result[k] = serialize_object_id(v)
        elif isinstance(v, list):
            result[k] = [
                serialize_object_id(item) if isinstance(item, dict) else
                str(item) if isinstance(item, ObjectId) else item
                for item in v
            ]
        else:
            result[k] = v
    return result 