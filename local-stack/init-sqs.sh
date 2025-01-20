bash
#!/bin/bash
aws sqs create-queue --endpoint-url http://localhost:4566 --queue-name video-queue --profile localstack