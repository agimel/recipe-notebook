## Technical Requirements

### Technology Stack (Simplified for 3-4 Day MVP)

#### Frontend
- React.js
- Vite (build tool for faster development)
- Material-UI or Ant Design (component library)
- React Hook Form (form management)
- React Hot Toast (notifications)
- Axios (HTTP client)

**Frontend Dependencies** (npm):
- `react` & `react-dom` - UI framework
- `vite` - Build tool
- `@mui/material` or `antd` - Component library
- `react-hook-form` - Form management
- `react-hot-toast` - Notifications
- `axios` - HTTP client
- `react-router-dom` - Routing

#### Backend
- Java Spring Boot
- Spring Web (REST API)
- Spring Data JPA (data persistence)
- H2 Database (file-based, auto-DDL enabled)
- Hibernate Validator (validation with @NotBlank, @Size, @Min, @Max)
- Spring Boot DevTools (development auto-restart)
- BCrypt (password hashing)
- Simple session-based authentication or lightweight JWT

**Backend Dependencies** (Maven):
- `spring-boot-starter-web` - REST API framework
- `spring-boot-starter-data-jpa` - Data persistence
- `spring-boot-starter-validation` - Bean validation
- `h2` - Embedded database
- `spring-boot-devtools` - Development auto-restart
- `spring-boot-starter-test` - Testing framework (includes JUnit 5, Mockito, AssertJ)
- `lombok` (optional) - Reduce boilerplate code
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (if using JWT) - Lightweight JWT implementation

#### Database Configuration
- H2 file-based database
- `spring.jpa.hibernate.ddl-auto=update` - Auto-generate schema (no migrations needed for MVP)
- Schema created automatically from JPA entities
- File location: `./data/recipes.mv.db`

#### Testing Strategy (MVP Focus)
- **Backend**: JUnit 5 unit tests for critical business logic (service layer), Mockito for mocking dependencies
- **Target Coverage**: 60-70% for core services (AuthService, RecipeService)
- **API Testing**: Manual testing with Postman/browser for integration validation
- **Frontend**: Manual browser testing on multiple devices
- **Focus**: Test critical paths (user registration, recipe CRUD, authentication) with unit tests, manual testing for UI/UX validation

#### Security Approach
- BCrypt password hashing (via Spring's built-in BCryptPasswordEncoder)
- Session-based authentication with HTTP sessions OR
- Simplified JWT implementation without Spring Security framework
- Input validation via Hibernate Validator
- CORS configuration for local development (React :3000, Spring Boot :8080)

#### Deployment
- Single executable JAR file
- Embedded Tomcat server (port 8080)
- React build served as static resources from Spring Boot
- H2 database auto-initialized on first run
- No external dependencies or services

---

### Removed from Original Stack (Deferred to Post-MVP)

**Removed for Timeline:**
- ~~Liquibase or Flyway~~ - Unnecessary for H2 with auto-DDL
- ~~Spring Security framework~~ - Too complex for MVP timeline
- ~~SpringDoc OpenAPI~~ - Nice-to-have, not critical
- ~~@tanstack/react-query~~ - Not needed for simple CRUD
- ~~GitHub Actions CI/CD~~ - Premature for local-only deployment
- ~~Frontend testing (Vitest/Jest)~~ - Defer to post-MVP, focus on backend tests

**Rationale:** These components add 8-12 hours of setup time without advancing the primary MVP goal of validating core recipe management functionality. They can be added post-MVP if the product validates successfully.

---

### Post-MVP Enhancement Path

When ready to scale beyond MVP:
1. Add Liquibase/Flyway for production database migrations
2. Implement full Spring Security with JWT
3. Add SpringDoc OpenAPI for API documentation
4. Implement comprehensive test coverage (80%+ target)
5. Set up GitHub Actions CI/CD pipeline
6. Migrate from H2 to PostgreSQL/MySQL
7. Deploy to cloud platform (AWS, Azure, Heroku)