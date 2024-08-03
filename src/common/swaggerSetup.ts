import { INestApplication } from "@nestjs/common";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { SwaggerSetup } from "./types";

export function setUpSwagger(app: INestApplication, config?: SwaggerSetup) {
  const options = new DocumentBuilder();
  if (config?.title) options.setTitle(config.title);
  if (config?.description) options.setDescription(config.description);
  if (config?.tag) options.addTag(config.tag);
  if (config?.version) options.setVersion(config.version);
  if (config?.addServer.length > 0) {
    config.addServer.forEach((server) => options.addServer(server));
  }

  options.build();
  const document = SwaggerModule.createDocument(app,{} as any, options as any);
  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: "My API Docs",
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  SwaggerModule.setup(
    config?.url ? config?.url : "swagger",
    app,
    document,
    customOptions
  );
}
