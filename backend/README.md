# Recipe Notebook - Backend

Spring Boot REST API for Recipe Management Application (MVP)

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Data JPA** - Data persistence
- **Spring Web** - REST API
- **Spring Validation** - Bean validation
- **H2 Database** - File-based embedded database
- **Lombok** - Reduce boilerplate code
- **JWT (jjwt)** - Authentication tokens
- **JUnit 5 & Mockito** - Testing

## Prerequisites

- Java 17 or higher
- Maven 3.6+ (or use the included Maven wrapper)

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── recipenotebook/
│   │   │           └── RecipeNotebookApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── schema.sql
│   │       └── data.sql
│   └── test/
│       └── java/
│           └── com/
│               └── recipenotebook/
│                   └── RecipeNotebookApplicationTests.java
├── pom.xml
└── .gitignore
```

## Getting Started

### 1. Build the Project

```powershell
mvn clean install
```

Or use the Maven wrapper (if available):

```powershell
./mvnw clean install
```

### 2. Run the Application

```powershell
mvn spring-boot:run
```

Or with the development profile:

```powershell
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The application will start on `http://localhost:8080`

### 3. Access H2 Console (Development)

- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/recipes`
- Username: `sa`
- Password: (leave empty)

## Configuration

### Database

The application uses H2 file-based database stored in `./data/recipes.mv.db`. The database is auto-created on first run with `ddl-auto=update` mode.

### CORS

CORS configuration will be set up programmatically to allow requests from the React frontend (`http://localhost:3000`).

### Logging

- Application logs: DEBUG level
- SQL queries: Enabled in development
- Hibernate parameter binding: TRACE level in development

## Running Tests

```powershell
mvn test
```

## Building for Production

```powershell
mvn clean package
```

The executable JAR will be created in `target/recipe-notebook-0.0.1-SNAPSHOT.jar`

Run the production build:

```powershell
java -jar target/recipe-notebook-0.0.1-SNAPSHOT.jar
```

## Development Notes

- **Auto-restart**: Spring Boot DevTools enables automatic restart on code changes
- **H2 Console**: Enabled in development for database inspection
- **Schema Management**: Auto-generated from JPA entities (no migrations needed for MVP)
- **Password Hashing**: BCrypt via Spring's BCryptPasswordEncoder

## Next Steps

After initialization, implement:
1. Entity models (User, Recipe, etc.)
2. Repository interfaces
3. Service layer with business logic
4. REST controllers
5. Authentication/Authorization logic
6. Global exception handling
7. CORS configuration
