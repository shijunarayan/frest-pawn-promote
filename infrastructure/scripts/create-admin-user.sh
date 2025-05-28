#!/bin/bash

# --- Configuration ---
USER_POOL_ID="ap-south-1_Uj980zO87"
USERNAME="admin"
EMAIL="ShijuNarayan@gmail.com"
PHONE_NUMBER="+15708473457" # Must be in E.164 format (e.g., +1XXXXXXXXXX)
CUSTOM_TENANT_ID="demo-tenant"
PASSWORD_TO_SET="1oG0+3Mk" # The actual password string

# --- User Attributes ---
# Format for AWS CLI: "Name=attrname,Value=attrvalue Name=otherattr,Value=othervalue"
# Ensure custom:tenantId is defined in your User Pool attributes.
USER_ATTRIBUTES="Name=email,Value=$EMAIL Name=phone_number,Value=$PHONE_NUMBER Name=custom:tenantId,Value=$CUSTOM_TENANT_ID"

echo "-----------------------------------------------------------------------"
echo "Attempting to create user: $USERNAME in User Pool: $USER_POOL_ID"
echo "-----------------------------------------------------------------------"

# Step 1: Create the user with the specified attributes and a temporary password.
# We use the desired password as the temporary password initially.
# --message-action SUPPRESS prevents Cognito from sending a default welcome email
# (which might contain the temporary password or an invitation code).
# Remove or change --message-action if you want Cognito to send a message.
aws cognito-idp admin-create-user \
  --user-pool-id "$USER_POOL_ID" \
  --username "$USERNAME" \
  --temporary-password "$PASSWORD_TO_SET" \
  --user-attributes $USER_ATTRIBUTES \
  --message-action SUPPRESS

# Check if the user creation was successful
if [ $? -eq 0 ]; then
  echo ""
  echo "User '$USERNAME' created successfully (initial status likely FORCE_CHANGE_PASSWORD)."
  echo "-----------------------------------------------------------------------"
  echo "Attempting to set password as permanent for '$USERNAME'..."
  echo "-----------------------------------------------------------------------"

  # Step 2: Set the password as permanent.
  # This changes the user's status from FORCE_CHANGE_PASSWORD to CONFIRMED.
  aws cognito-idp admin-set-user-password \
    --user-pool-id "$USER_POOL_ID" \
    --username "$USERNAME" \
    --password "$PASSWORD_TO_SET" \
    --permanent

  if [ $? -eq 0 ]; then
    echo ""
    echo "Password for '$USERNAME' has been set as permanent."
    echo "User status should now be CONFIRMED."
  else
    echo ""
    echo "Error: Failed to set permanent password for '$USERNAME'."
    echo "The user might still be in FORCE_CHANGE_PASSWORD state with the temporary password."
    echo "Please check the AWS Cognito console for the user's status."
  fi
else
  echo ""
  echo "Error: Failed to create user '$USERNAME'."
  echo "This could be because:"
  echo "  1. The user already exists."
  echo "  2. The custom attribute 'custom:tenantId' is not defined in the User Pool."
  echo "  3. The phone number format is incorrect."
  echo "  4. Insufficient IAM permissions for the AWS CLI."
  echo ""
  echo "If the user already exists and you want to update attributes or reset the password, you would use:"
  echo "  aws cognito-idp admin-update-user-attributes ..."
  echo "  aws cognito-idp admin-set-user-password ..."
fi

echo "-----------------------------------------------------------------------"
echo "Script finished."
echo "-----------------------------------------------------------------------"