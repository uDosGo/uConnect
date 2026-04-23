#!/bin/bash

# Create a spec template for uDos features

echo "📝 Creating spec template..."

if [ -z "$1" ]; then
    SPEC_NAME="SPEC_TEMPLATE"
else
    SPEC_NAME="$1"
fi

DATE=$(date +"%Y-%m-%d")

cat > "${SPEC_NAME}.md" << EOF
# [Spec Name] - $DATE

## 🎯 Overview

### Problem Statement
<Describe the problem this spec addresses>

### Proposed Solution
<High-level description of the solution>

### User Impact
<How this affects end users>

### Technical Impact
<How this affects the codebase and architecture>

## 📋 Technical Requirements

### Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Non-Functional Requirements
- Performance: <requirements>
- Security: <requirements>
- Scalability: <requirements>

### Dependencies
- Internal: <internal dependencies>
- External: <external dependencies>
- Tools: <required tools>

## ⏱️ Estimated Effort

- Design: <X hours/days>
- Development: <X hours/days>
- Testing: <X hours/days>
- Documentation: <X hours/days>
- **Total**: <X hours/days>

## ✅ Acceptance Criteria

### Must Have
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

### Should Have
- [ ] Criteria 1
- [ ] Criteria 2

### Could Have
- [ ] Criteria 1

## 🚀 Implementation Plan

### Phase 1: Design (Day 1-2)
- [ ] Create detailed design document
- [ ] Review with team
- [ ] Finalize architecture decisions

### Phase 2: Development (Day 3-7)
- [ ] Set up development environment
- [ ] Implement core functionality
- [ ] Add error handling
- [ ] Implement logging
- [ ] Add configuration options

### Phase 3: Testing (Day 8-9)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Perform manual testing
- [ ] Fix identified issues

### Phase 4: Documentation (Day 10)
- [ ] Update API documentation
- [ ] Update user documentation
- [ ] Add examples
- [ ] Update README

## 🔍 Testing Strategy

### Unit Tests
- Test individual components in isolation
- Mock external dependencies

### Integration Tests
- Test component interactions
- Test with real dependencies where possible

### End-to-End Tests
- Test complete user flows
- Test error scenarios

### Performance Tests
- Load testing
- Stress testing
- Benchmarking

## 📦 Deployment Strategy

### Staging Deployment
- Deploy to staging environment
- Perform final testing
- Get stakeholder approval

### Production Deployment
- Scheduled deployment during low-traffic period
- Rollback plan in place
- Monitoring configured

## 🛡️ Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| Risk 1 | High/Medium/Low | High/Medium/Low | Mitigation approach |
| Risk 2 | High/Medium/Low | High/Medium/Low | Mitigation approach |

## 🤖 Future Considerations

- Potential extensions
- Scalability improvements
- Integration with other systems
- Deprecation plans

## 📚 References

- Related specs
- API documentation
- Architecture decisions
- External resources

## 🎨 UI/UX Considerations (if applicable)

- Wireframes
- User flows
- Accessibility requirements
- Internationalization needs

## 🔧 Configuration Options

- Environment variables
- Configuration files
- Feature flags
- Default values

---

**Status**: Draft 🟡 | In Progress 🟠 | Review 🟢 | Completed ✅
**Priority**: P0 🔴 | P1 🟠 | P2 🟡 | P3 🔵
**Target Round**: Round [X]
**Spec Owner**: [Your Name]
**Last Updated**: $DATE
EOF

echo "✅ Spec template created: ${SPEC_NAME}.md"
echo ""
echo "📋 Template includes:"
echo "   - Overview with problem/solution"
echo "   - Technical requirements"
echo "   - Estimated effort breakdown"
echo "   - Acceptance criteria"
echo "   - Implementation plan"
echo "   - Testing strategy"
echo "   - Deployment strategy"
echo "   - Risk assessment"
echo "   - Future considerations"
echo ""
echo "💡 Tip: Use this template for all new specs to maintain consistency"
echo "   Customize sections as needed for your specific feature"

exit 0