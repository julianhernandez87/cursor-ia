package com.demo.config;

import com.demo.exception.ErrorResponse;
import io.swagger.v3.core.converter.AnnotatedType;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.core.converter.ResolvedSchema;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI (Swagger) as contract: real error responses and Bearer security so the API is self-describing.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("Demo API")
                        .version("1.0")
                        .description("REST API with JWT authentication and user management."))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token from POST /api/auth/login")));
    }

    @Bean
    public OpenApiCustomizer globalErrorResponses() {
        ResolvedSchema resolvedSchema = ModelConverters.getInstance()
                .resolveAsResolvedSchema(new AnnotatedType(ErrorResponse.class));
        Schema<?> errorSchema = resolvedSchema.schema;
        Content content = new Content()
                .addMediaType("application/json", new MediaType().schema(errorSchema));

        return openApi -> {
            openApi.getComponents().getSchemas().put(resolvedSchema.schema.getName(), errorSchema);
            if (resolvedSchema.referencedSchemas != null) {
                resolvedSchema.referencedSchemas.forEach((name, schema) ->
                        openApi.getComponents().getSchemas().put(name, schema));
            }
            openApi.getPaths().values().forEach(pathItem ->
                    pathItem.readOperations().forEach(operation -> {
                        operation.getResponses()
                                .addApiResponse("400", new ApiResponse().description("Validation failed").content(content));
                        operation.getResponses()
                                .addApiResponse("401", new ApiResponse().description("Unauthorized").content(content));
                        operation.getResponses()
                                .addApiResponse("403", new ApiResponse().description("Forbidden").content(content));
                        operation.getResponses()
                                .addApiResponse("404", new ApiResponse().description("Resource not found").content(content));
                        operation.getResponses()
                                .addApiResponse("409", new ApiResponse().description("Conflict (e.g. duplicate email)").content(content));
                        operation.getResponses()
                                .addApiResponse("500", new ApiResponse().description("Internal server error").content(content));
                    }));
        };
    }
}
