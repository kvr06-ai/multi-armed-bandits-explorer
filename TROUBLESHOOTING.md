# Troubleshooting Guide

This document covers common issues and their solutions when running the Multi-Armed Bandit Explorer.

## Backend Dependencies Issues

### Problem: Dependency Installation Errors

When running `pip install -r requirements.txt`, you might encounter errors like:

```
Cannot import 'setuptools.build_meta'
```

or 

```
ModuleNotFoundError: No module named 'uvicorn'
```

**Solution**: 
1. Make sure you have the latest pip, setuptools, and wheel packages:
   ```
   pip install --upgrade pip setuptools wheel
   ```

2. Use the updated requirements.txt with looser version constraints:
   ```
   fastapi>=0.101.1
   uvicorn>=0.23.2
   pydantic>=2.1.1
   numpy>=1.26.0
   scipy>=1.13.0
   pytest>=7.4.0
   python-multipart>=0.0.6
   ```

### Problem: Pydantic Compatibility Issues

When running the backend with newer versions of Pydantic (2.x), you might encounter errors like:

```
TypeError: To define root models, use `pydantic.RootModel` rather than a field called '__root__'
```

or

```
TypeError: conlist() got an unexpected keyword argument 'min_items'
```

**Solution**:
1. Update the models in `app/models/simulation.py`:
   - Replace `__root__` with `root` attribute in a `RootModel`-based class
   - Replace `conlist` with `List` and `Field(..., min_length=2)`
   - Use `model_validator` instead of `validator`

### Problem: CORS Issues

If you see errors in the browser console like:

```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/simulations' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

or 

```
Failed to load resource: net::ERR_FAILED
```

**Solution**:
1. Make sure the backend has proper CORS configuration in `main.py`:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],  # Frontend origin
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. Ensure the `settings.py` file exists in `backend/app/core/` with the following content:
   ```python
   from pydantic import BaseModel
   
   class Settings(BaseModel):
       PROJECT_NAME: str = "Multi-Armed Bandit Explorer API"
       API_PREFIX: str = "/api/v1"
       BACKEND_CORS_ORIGINS: list = ["http://localhost:5173"]
   
   settings = Settings()
   ```

3. Restart both the frontend and backend servers to apply the changes.

## Frontend Issues

### Problem: Failed to Load Configuration Data

If the frontend shows "Failed to load configuration data", it might be due to:

1. The backend not running
2. CORS issues
3. API endpoint changes

**Solution**:
1. Ensure the backend is running on http://localhost:8000
2. Check browser console for specific error messages
3. Verify the API endpoints are accessible by testing them directly:
   ```
   curl http://localhost:8000/api/v1/config/algorithms
   curl http://localhost:8000/api/v1/config/distributions
   ```

## Running the Application

For the most reliable experience, use the provided `run.sh` script which includes fixes for these issues:

```bash
chmod +x run.sh
./run.sh
```

If you encounter further issues, please open an issue on the GitHub repository. 