# Recipe Notebook - Backend

Spring Boot REST API for Recipe Management Application (MVP)

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Data JPA** - Data persistence and repositories
- **Spring Web** - REST API
- **Spring Validation** - Bean validation
- **Spring Security Crypto** - Password encryption (BCrypt)
- **H2 Database** - File-based embedded database
- **Flyway** - Database migrations and versioning
- **Lombok** - Reduce boilerplate code
- **JWT (jjwt 0.12.3)** - Authentication tokens
- **JUnit 5 & Mockito** - Testing framework

## Prerequisites

- Java 17 or higher
- Maven 3.6+ (or use the included Maven wrapper)

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/recipenotebook/
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── WebConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── CategoryController.java
│   │   │   │   ├── HealthController.java
│   │   │   │   └── RecipeController.java
│   │   │   ├── dto/
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── CategoryDTO.java
│   │   │   │   ├── LoginRequestDTO.java
│   │   │   │   ├── RecipeDetailDTO.java
│   │   │   │   └── [20+ DTOs for API requests/responses]
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── Recipe.java
│   │   │   │   ├── Category.java
│   │   │   │   ├── Ingredient.java
│   │   │   │   ├── Step.java
│   │   │   │   └── Difficulty.java (enum)
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── RecipeNotFoundException.java
│   │   │   │   ├── AuthenticationException.java
│   │   │   │   └── [7+ custom exceptions]
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── RecipeRepository.java
│   │   │   │   ├── CategoryRepository.java
│   │   │   │   └── RecipeSpecification.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── JwtService.java
│   │   │   │   ├── RecipeService.java
│   │   │   │   └── CategoryService.java
│   │   │   └── RecipeNotebookApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── db/migration/
│   │       │   └── V1__create_initial_schema.sql
│   │       ├── schema.sql
│   │       └── data.sql
│   └── test/java/com/recipenotebook/
│       ├── controller/
│       ├── service/
│       └── RecipeNotebookApplicationTests.java
├── data/
│   └── recipes.mv.db (auto-generated H2 database)
├── pom.xml
└── README.md
```

## API Endpoints

### Health Check
- `GET /health` - Application health status

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login (returns JWT token)

### Recipes
- `POST /recipes` - Create a new recipe (requires authentication)
- `GET /recipes` - List all recipes (with filtering and pagination)
- `GET /recipes/{id}` - Get recipe details by ID
- `PUT /recipes/{id}` - Update an existing recipe (requires authentication)
- `DELETE /recipes/{id}` - Delete a recipe (requires authentication)

### Categories
- `GET /categories` - Get all available recipe categories

## Features

- ✅ **User Authentication**: JWT-based authentication with secure password hashing (BCrypt)
- ✅ **Recipe Management**: Full CRUD operations for recipes with ingredients and cooking steps
- ✅ **Advanced Filtering**: Search and filter recipes by title, difficulty, category, and cooking time
- ✅ **Pagination**: Efficient pagination support for recipe listings
- ✅ **Category Management**: Predefined recipe categories (Breakfast, Lunch, Dinner, etc.)
- ✅ **Data Validation**: Comprehensive input validation with detailed error messages
- ✅ **Exception Handling**: Global exception handler with standardized error responses
- ✅ **Database Migrations**: Flyway-based schema versioning and migration management
- ✅ **CORS Support**: Configured for frontend integration (http://localhost:3000)

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

The application uses H2 file-based database stored in `./data/recipes.mv.db`. Database schema is managed by Flyway migrations located in `src/main/resources/db/migration/`.

**Migration Files:**
- `V1__create_initial_schema.sql` - Creates users, recipes, categories, ingredients, steps, and recipe_categories tables

### JPA/Hibernate

- **DDL Mode**: `validate` - Validates schema against entity mappings (schema managed by Flyway)
- **Show SQL**: Enabled in development for debugging
- **SQL Formatting**: Enabled for better readability
- **Batch Processing**: Optimized with batch size of 20 for better performance

### JWT Authentication

JWT secret key is configurable via environment variable:
```
JWT_SECRET=your-secret-key-minimum-32-characters-required
```

Default development key is provided in `application.properties` (change in production!)

### CORS

CORS is configured in `WebConfig.java` to allow requests from:
- `http://localhost:3000` (React frontend)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allows credentials and common headers

### Logging

- Application logs: `DEBUG` level
- Spring Web: `INFO` level  
- SQL queries: `DEBUG` level (visible in console)
- Hibernate parameter binding: `TRACE` level in development

## Running Tests

```powershell
mvn test
```

Run specific test class:
```powershell
mvn test -Dtest=RecipeServiceTest
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

**Production Configuration:**
- Set `JWT_SECRET` environment variable with a secure key
- Consider using a production-grade database (PostgreSQL, MySQL)
- Disable H2 console in production
- Review and adjust CORS settings for production frontend URL

## Database Schema

The application uses the following database tables:

- **users** - User accounts with authentication credentials
- **recipes** - Recipe metadata (title, difficulty, cooking time)
- **categories** - Recipe categories (predefined: Breakfast, Lunch, Dinner, etc.)
- **recipe_categories** - Many-to-many relationship between recipes and categories
- **ingredients** - Recipe ingredients with quantities
- **steps** - Cooking steps with step order

All tables include appropriate foreign key constraints, indexes, and cascade delete rules for data integrity.

## Development Notes

- **Auto-restart**: Spring Boot DevTools enables automatic restart on code changes
- **H2 Console**: Enabled in development for database inspection
- **Schema Management**: Managed by Flyway migrations (not JPA auto-DDL)
- **Password Hashing**: BCrypt via Spring Security's BCryptPasswordEncoder
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Specification Pattern**: Used for dynamic recipe filtering and search
- **DTO Pattern**: Clear separation between API contracts and domain entities
- **Global Exception Handling**: Centralized error handling with `@ControllerAdvice`

## Key Implementation Details

### Entity Relationships
- **User** ↔ **Recipe**: One-to-Many (user owns multiple recipes)
- **Recipe** ↔ **Category**: Many-to-Many (recipe can have multiple categories)
- **Recipe** ↔ **Ingredient**: One-to-Many (embedded in recipe)
- **Recipe** ↔ **Step**: One-to-Many (ordered steps, embedded in recipe)

### Security
- Passwords are hashed using BCrypt (strength 10)
- JWT tokens include user ID and username claims
- Protected endpoints require valid JWT in Authorization header
- Recipe operations verify user ownership before allowing modifications

### Validation
- Input validation using Bean Validation annotations (@NotNull, @Size, etc.)
- Custom validators for business rules
- Detailed validation error responses with field-level error messages

## Troubleshooting

### Port Already in Use
If port 8080 is already in use, change it in `application.properties`:
```properties
server.port=8081
```

### Database Locked Error
Stop any running instances of the application or close the H2 console before restarting.

### Flyway Migration Errors
If migrations fail, you may need to clean the database:
```powershell
mvn flyway:clean
mvn spring-boot:run
```

### JWT Token Issues
Ensure the JWT_SECRET is at least 32 characters long for HS256 algorithm.

## Additional Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/3.2.1/reference/html/)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [JWT Introduction](https://jwt.io/introduction)

## License

This project is part of the Recipe Notebook MVP application.
