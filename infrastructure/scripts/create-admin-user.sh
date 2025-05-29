#!/bin/bash

# Config
USER_POOL_ID="ap-south-1_7hbFeS0bX"
USERNAME="admin"
EMAIL="ShijuNarayan@gmail.com"
PHONE_NUMBER="+15708473457"
CUSTOM_TENANT_ID="demo-tenant"
PASSWORD="1oG0+3Mk"
REGION="ap-south-1"
PROFILE="frest-dev"
USER_ROLES_TABLE="UserRolesTable"
ASSIGNED_BY="system"

# Attributes
ATTRS="Name=email,Value=$EMAIL Name=phone_number,Value=$PHONE_NUMBER Name=custom:tenantId,Value=$CUSTOM_TENANT_ID"

echo "Creating user: $USERNAME"

aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$USERNAME" \
  --temporary-password "$PASSWORD" \
  --user-attributes $ATTRS \
  --message-action SUPPRESS \
  --profile "$PROFILE"

if [ $? -eq 0 ]; then
  echo "User created. Setting permanent password..."

  aws cognito-idp admin-set-user-password \
    --user-pool-id "$USER_POOL_ID" \
    --username "$USERNAME" \
    --password "$PASSWORD" \
    --permanent \
    --profile "$PROFILE"

  if [ $? -eq 0 ]; then
    echo "Password set successfully."

    echo "Retrieving userId (sub)..."
    USER_ID=$(aws cognito-idp admin-get-user \
      --user-pool-id "$USER_POOL_ID" \
      --username "$USERNAME" \
      --profile "$PROFILE" \
      --query "UserAttributes[?Name=='sub'].Value" \
      --output text)

    if [ -n "$USER_ID" ]; then
      echo "Assigning admin role to $USERNAME (userId: $USER_ID)..."

      TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

      aws dynamodb put-item \
        --table-name "$USER_ROLES_TABLE" \
        --item "{
          \"tenantId\": {\"S\": \"$CUSTOM_TENANT_ID\"},
          \"userId\": {\"S\": \"$USER_ID\"},
          \"roleId\": {\"S\": \"Admin\"},
          \"assignedAt\": {\"S\": \"$TIMESTAMP\"},
          \"assignedBy\": {\"S\": \"$ASSIGNED_BY\"}
        }" \
        --region "$REGION" \
        --profile "$PROFILE"

      echo "✅ Admin role assigned."
    else
      echo "❌ Failed to retrieve userId."
    fi

  else
    echo "❌ Failed to set permanent password."
  fi
else
  echo "❌ Failed to create user. Check if user exists or attributes are invalid."
fi
