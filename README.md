# Cloud Function for Sending Verification Emails and Updating Mail Tracking

This serverless Cloud Function is designed to handle events triggered by a Pub/Sub topic, sending verification emails, updating mail tracking information in a MySQL database, and configuring private service access for SQL databases.

## Functionality

- **Event Trigger**: The function is triggered by events published to a Pub/Sub topic. These events contain information about the user and their email address.
- **Email Sending**: Upon receiving an event, the function sends a verification email to the specified email address. The email contains a link for the user to verify their email address.
- **Database Update**: After sending the email, the function updates the mail tracking information in a MySQL database. It inserts a new record if the email address is not already present or updates the `mail_sent` field if the email address already exists in the database.

## Dependencies

- **axios**: For making HTTP requests to the Mailgun API to send emails.
- **fs**: For reading the email template file.
- **Handlebars**: For compiling email templates.
- **@google-cloud/functions-framework**: For handling Cloud Function events.
- **mysql2**: For connecting to and interacting with a MySQL database.

## Environment Variables

The function requires the following environment variables to be set:

- `MAILGUN_USER`: Mailgun API username for authentication.
- `MAILGUN_PASSWORD`: Mailgun API password for authentication.
- `SQL_HOST`: Hostname or IP address of the MySQL database server.
- `SQL_USER`: Username for accessing the MySQL database.
- `SQL_PASSWORD`: Password for accessing the MySQL database.
- `SQL_DB`: Name of the MySQL database.
- `VPC_ID`: ID of the VPC where the SQL database resides.
- `REGION`: Region where the Cloud Function is deployed.

## Usage

1. Ensure that the required environment variables are properly configured in the environment where the function will be deployed.
2. Zip the function code along with its dependencies and any necessary configuration files.
3. Upload the zip file to an S3 bucket or another suitable storage location accessible by the Cloud Function.
4. Create a Cloud Function in your cloud provider's console, specifying the trigger, runtime, memory, and other relevant settings.
5. Point the Cloud Function to the uploaded zip file in the storage location.
6. Deploy the Cloud Function.

## Configuration

- **Private Access Connector**: To configure a private access connector for the SQL database, which connects the Cloud Function to communicate the database of the configured VPC. This will allow the function to communicate securely with the SQL database using private IP addresses, ensuring that the traffic remains within the VPC and is not exposed to the public internet.

- **Role Bindings**: Bind the appropriate roles to the Cloud Function service account to grant the necessary permissions. For Cloud Functions of the 1st generation (gen1), use the `roles/cloudfunctions.invoker` role. For Cloud Functions of the 2nd generation (gen2), use the `roles/run.invoker` role.