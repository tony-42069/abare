"""
Script to run the ABARE platform with proper path setup.
"""
import os
import sys

# Add project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "core.main:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    )
