# NODEJS API WITH OKTA AUTH

##### To get details about okta creation, verify:
- https://developer.okta.com/code/nodejs/#recommended-guides

**Important: This API require client-credentials authentication method**

API endpoints: 
- /api/hello -> Returns a Hello World  **No authentication Required**
- /api/token -> Returns a valid token  **No authentication Required**
- /api/whoami -> Return details from token **Send token in Header Bearer Authorization**

### Executing Container:

Before Creating the container, create a file named: "my_env.list", and add the following parameters:
- OKTA_URL=<your okta url auth>
- CLIENT=<your okta id>
- SECRET=<your secret key>

```
docker build -t node-with-okta .
docker run --env-file ./my_env.list -p 8080:8080 node-with-okta
```

It will be accessible on: http://localhost:8080