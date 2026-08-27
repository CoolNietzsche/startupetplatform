# Fayda Platform API Specification

## Overview

The Fayda Platform API provides access to Ethiopia's National Digital ID system (id.et), allowing authorized applications to verify identity information and retrieve personal details based on Federal Civil Numbers (FCN).

## Authentication

The Fayda Platform uses OAuth 2.0 for authentication:

1. **Client Registration**: Organizations must register with the Digital ID Authority to receive client credentials
2. **Access Token**: Applications must obtain an access token before making API calls
3. **API Key**: All requests require an API key in the header

```
Authorization: Bearer {access_token}
X-API-Key: {api_key}
```

## API Endpoints

### 1. Verify Identity

**Endpoint**: `POST /api/v1/identity/verify`

**Description**: Verifies if a person exists in the National ID database using their FCN.

**Request Parameters**:
```json
{
  "fcn": "ETH1234567890",
  "dateOfBirth": "YYYY-MM-DD"
}
```

**Response**:
```json
{
  "verified": true,
  "message": "Identity verified successfully"
}
```

### 2. Get Personal Information

**Endpoint**: `GET /api/v1/identity/{fcn}`

**Description**: Retrieves personal information associated with the FCN.

**Headers**:
- `Authorization`: Bearer token
- `X-API-Key`: API key

**Path Parameters**:
- `fcn`: Federal Civil Number

**Response**:
```json
{
  "fcn": "ETH1234567890",
  "firstName": "Abebe",
  "lastName": "Kebede",
  "dateOfBirth": "1985-06-15",
  "gender": "M",
  "nationality": "Ethiopian",
  "idExpiryDate": "2030-06-14",
  "idIssueDate": "2020-06-15",
  "phoneNumber": "+251911234567",
  "email": "abebe.kebede@example.com"
}
```

### 3. Validate FCN

**Endpoint**: `POST /api/v1/identity/validate`

**Description**: Validates if an FCN is properly formatted and could be legitimate.

**Request Parameters**:
```json
{
  "fcn": "ETH1234567890"
}
```

**Response**:
```json
{
  "valid": true,
  "message": "FCN format is valid"
}
```

## VeriFayda 2.0 eSignet Relying Party Integration

The VeriFayda 2.0 eSignet system provides enhanced identity verification and digital signature capabilities for relying parties (RPs) like StartupET. This integration allows for secure electronic document signing with legally binding digital signatures backed by the National ID system.

### Integration Flow

1. **Registration as a Relying Party (RP)**
   - Register your application with the Fayda Digital ID Authority
   - Receive RP credentials (client_id, client_secret)
   - Configure authorized redirect URIs

2. **Authentication Flow**
   - Implement OAuth 2.0 authorization code flow
   - Direct users to the Fayda authentication endpoint
   - Receive authorization code and exchange for access token

3. **eSignet Document Signing**
   - Prepare document for signing (PDF format preferred)
   - Generate document hash using SHA-256
   - Create signing request with document hash
   - Redirect user to VeriFayda signing portal
   - Receive signed document with cryptographic signature

### eSignet API Endpoints

#### 1. Initialize Signing Request

**Endpoint**: `POST /api/v2/esignet/initialize`

**Description**: Creates a new document signing request.

**Request Parameters**:
```json
{
  "documentHash": "sha256-hash-of-document",
  "documentName": "Business Registration Form",
  "callbackUrl": "https://startupet.gov.et/api/callback/signature",
  "signerFcn": "ETH1234567890",
  "expiresIn": 3600
}
```

**Response**:
```json
{
  "requestId": "sig-req-123456",
  "signingUrl": "https://id.et/sign/sig-req-123456",
  "expiresAt": "2023-04-23T12:30:45Z"
}
```

#### 2. Verify Signature

**Endpoint**: `POST /api/v2/esignet/verify`

**Description**: Verifies the authenticity of a document signature.

**Request Parameters**:
```json
{
  "signatureId": "sig-123456",
  "documentHash": "sha256-hash-of-document"
}
```

**Response**:
```json
{
  "verified": true,
  "signerInfo": {
    "fcn": "ETH1234567890",
    "name": "Abebe Kebede",
    "signedAt": "2023-04-23T11:45:22Z"
  },
  "certificateInfo": {
    "issuer": "Ethiopia Digital ID Authority",
    "validFrom": "2023-01-01T00:00:00Z",
    "validTo": "2024-01-01T00:00:00Z"
  }
}
```

### Security Requirements

1. **TLS/SSL**: All communications must use HTTPS with TLS 1.2 or higher
2. **API Key Rotation**: Rotate API keys every 90 days
3. **IP Whitelisting**: Restrict API access to whitelisted IP addresses
4. **Audit Logging**: Maintain logs of all API calls for at least 2 years
5. **User Consent**: Obtain explicit user consent before initiating signing process

### VeriFayda SDK

The VeriFayda JavaScript SDK simplifies integration:

```javascript
// Initialize the SDK
const verifayda = new VeriFaydaClient({
  clientId: 'your-client-id',
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Create a signing request
const signingRequest = await verifayda.createSigningRequest({
  document: documentBytes,
  documentName: 'Business Registration Form',
  signerFcn: 'ETH1234567890',
  callbackUrl: 'https://your-app.com/callback'
});

// Redirect to signing portal
window.location.href = signingRequest.signingUrl;
```

## Error Responses

```json
{
  "errorCode": "4001",
  "message": "Invalid FCN format",
  "details": "The provided FCN does not match the required format"
}
```

Common error codes:
- `4001`: Invalid FCN format
- `4003`: Person not found
- `4004`: Unauthorized access
- `5001`: Internal server error

## Integration Guidelines

1. **Security**: All communications must be over HTTPS
2. **Rate Limiting**: Maximum 100 requests per minute
3. **Data Protection**: Applications must comply with Ethiopia's data protection laws
4. **Consent**: User consent must be obtained before retrieving personal information
5. **Access Scope**: Only request data fields that are necessary for your application

## FCN Format

The Ethiopian Federal Civil Number (FCN) follows this format:
- ETH prefix followed by 10 digits
- Example: ETH1234567890

## Implementation Notes for StartupET

For our application, we'll use this API to:
1. Verify the identity of startup founders
2. Auto-populate founder details when users enter their FCN
3. Ensure data accuracy by using official government records
4. Comply with regulatory requirements for business registration
5. Enable digital signatures for application documents

## Local Implementation (Development Only)

For development purposes, we'll implement a mock version of this API that simulates the behavior without making actual calls to the production Fayda Platform.
