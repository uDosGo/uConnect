#!/bin/bash

# Validate P2 feature requirements in the development environment

echo "🔍 Validating P2 feature requirements..."

set -e  # Exit on error

# Track validation results
email_templates_status="📋"
smtp_config_status="📋"
email_schema_status="📋"
export_dir_status="📋"
import_validation_status="📋"
tree_command_status="📋"
thread_tests_status="📋"
webhook_config_status="📋"
webhook_worker_status="📋"
openapi_spec_status="📋"
openapi_tools_status="📋"

# 1. Email Notifications Validation
echo "Checking Email Notifications requirements..."

# Check for email template directory
if [ -d "templates/email" ]; then
    echo "✅ Email templates directory exists"
    email_templates_status="✅"
else
    echo "⚠️  Email templates directory missing (templates/email/)"
    email_templates_status="⚠️"
fi

# Check for SMTP configuration
if [ -f "config/email.yaml" ] || [ -f "config/smtp.json" ]; then
    echo "✅ SMTP configuration found"
    smtp_config_status="✅"
else
    echo "📋 SMTP configuration needed (config/email.yaml or config/smtp.json)"
    smtp_config_status="📋"
fi

# Check for email queue schema
if grep -r "email_queue" docs/specs/ 2>/dev/null || [ -f "db/migrations/*.email.sql" ]; then
    echo "✅ Email queue schema references found"
    email_schema_status="✅"
else
    echo "📋 Email queue schema migration needed"
    email_schema_status="📋"
fi

# 2. Feed Export/Import Validation
echo ""
echo "Checking Feed Export/Import requirements..."

# Check for export directory
if [ -d "exports" ]; then
    echo "✅ Exports directory exists"
    export_dir_status="✅"
else
    echo "📋 Exports directory can be created: mkdir exports"
    export_dir_status="📋"
fi

# Check for import validation scripts
if [ -f "scripts/validate-import.sh" ]; then
    echo "✅ Import validation script exists"
    import_validation_status="✅"
else
    echo "📋 Import validation script needed"
    import_validation_status="📋"
fi

# 3. Reply Threading UI Validation
echo ""
echo "Checking Reply Threading UI requirements..."

# Check for tree rendering utilities
if command -v tree &> /dev/null; then
    echo "✅ Tree command available for ASCII rendering"
    tree_command_status="✅"
else
    echo "📋 Tree command can be installed: brew install tree"
    tree_command_status="📋"
fi

# Check for thread visualization tests
if [ -f "test/thread-rendering.test.js" ]; then
    echo "✅ Thread rendering tests exist"
    thread_tests_status="✅"
else
    echo "📋 Thread rendering tests needed"
    thread_tests_status="📋"
fi

# 4. Webhook Retry Queue Validation
echo ""
echo "Checking Webhook Retry Queue requirements..."

# Check for webhook configuration
if [ -f "config/webhooks.yaml" ] || [ -f "config/webhooks.json" ]; then
    echo "✅ Webhook configuration found"
    webhook_config_status="✅"
else
    echo "📋 Webhook configuration needed (config/webhooks.yaml)"
    webhook_config_status="📋"
fi

# Check for queue worker script
if [ -f "scripts/webhook-worker.sh" ]; then
    echo "✅ Webhook worker script exists"
    webhook_worker_status="✅"
else
    echo "📋 Webhook worker script needed"
    webhook_worker_status="📋"
fi

# 5. API Documentation Validation
echo ""
echo "Checking API Documentation requirements..."

# Check for OpenAPI spec
if [ -f "docs/api/openapi.yaml" ] || [ -f "docs/api/openapi.json" ]; then
    echo "✅ OpenAPI specification found"
    openapi_spec_status="✅"
else
    echo "📋 OpenAPI specification needed (docs/api/openapi.yaml)"
    openapi_spec_status="📋"
fi

# Check for API documentation tools
if command -v npx &> /dev/null && npx @redocly/cli --version &> /dev/null; then
    echo "✅ Redocly CLI available for OpenAPI validation"
    openapi_tools_status="✅ (Redocly)"
elif command -v npx &> /dev/null && npx swagger-cli --version &> /dev/null; then
    echo "✅ Swagger CLI available for OpenAPI validation"
    openapi_tools_status="✅ (Swagger)"
else
    echo "📋 OpenAPI tools can be installed: npm install -g @redocly/cli"
    openapi_tools_status="📋"
fi

# Summary
echo ""
echo "📋 P2 Feature Validation Summary:"
echo ""
echo "Email Notifications:"
echo "   $email_templates_status Email templates directory"
echo "   $smtp_config_status SMTP configuration"
echo "   $email_schema_status Email queue schema"
echo ""
echo "Feed Export/Import:"
echo "   $export_dir_status Exports directory"
echo "   $import_validation_status Import validation"
echo ""
echo "Reply Threading UI:"
echo "   $tree_command_status Tree rendering tools"
echo "   $thread_tests_status Thread rendering tests"
echo ""
echo "Webhook Retry Queue:"
echo "   $webhook_config_status Webhook configuration"
echo "   $webhook_worker_status Webhook worker script"
echo ""
echo "API Documentation:"
echo "   $openapi_spec_status OpenAPI specification"
echo "   $openapi_tools_status OpenAPI tools"

# Count ready vs needed
ready_count=0
needed_count=0

for status in "$email_templates_status" "$smtp_config_status" "$email_schema_status" "$export_dir_status" "$import_validation_status" "$tree_command_status" "$thread_tests_status" "$webhook_config_status" "$webhook_worker_status" "$openapi_spec_status"; do
    if [[ "$status" == "✅" ]]; then
        ((ready_count++))
    elif [[ "$status" == "📋" ]] || [[ "$status" == "⚠️" ]]; then
        ((needed_count++))
    fi
done

# Handle openapi_tools_status separately since it can have text
if [[ "$openapi_tools_status" == ✅* ]]; then
    ((ready_count++))
else
    ((needed_count++))
fi

total_features=11
echo ""
echo "📊 Overall Status:"
echo "   ✅ Ready: $ready_count/$total_features"
echo "   📋 Needs attention: $needed_count/$total_features"

if [ $ready_count -ge $((($total_features * 70) / 100)) ]; then
    echo ""
    echo "🎉 Environment is ready for P2 feature implementation!"
    echo "   Some components may need setup during implementation."
else
    echo ""
    echo "⚠️  Some requirements need attention before full P2 implementation."
    echo "   Run 'npm run prepare:p2' for detailed setup instructions."
fi

exit 0