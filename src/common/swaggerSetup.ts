import { INestApplication } from "@nestjs/common";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { SwaggerSetup } from "./types";

export function setUpSwagger(
  app: INestApplication,
  config: SwaggerSetup = { isAuthBear: true, persistAuthorization: true }
) {
  let options = new DocumentBuilder();
  if (config.title) options = options.setTitle(config.title);
  if (config.description) options = options.setDescription(config.description);
  if (config.tag) options = options.addTag(config.tag);
  if (config.version) options = options.setVersion(config.version);
  if (config.addServer?.length > 0) {
    config.addServer.forEach((server) => (options = options.addServer(server)));
  }
  options = options.addBearerAuth();

  const swagger = options.build();
  const document = SwaggerModule.createDocument(app, swagger as any);
  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: "My API Docs",
    swaggerOptions: {
      persistAuthorization: config.persistAuthorization ? true : false,
    },
  };
  SwaggerModule.setup(
    config?.url ? config?.url : "swagger",
    app,
    document,
    customOptions
  );
}
