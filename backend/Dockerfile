# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create folders for uploads (Linux style)
RUN mkdir -p /app/uploads/profiles /app/uploads/documents /app/uploads/receipts

EXPOSE 8080
# Override Windows paths with Linux paths for the cloud
ENV UPLOAD_DIR_PROFILE_PICS=/app/uploads/profiles
ENV UPLOAD_DIR_DOCUMENTS=/app/uploads/documents
ENV UPLOAD_DIR_EXPENSE_RECEIPTS=/app/uploads/receipts

ENTRYPOINT ["java", "-jar", "app.jar"]