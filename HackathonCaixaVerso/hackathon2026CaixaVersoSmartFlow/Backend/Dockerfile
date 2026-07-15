FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project file first for better layer caching
COPY *.csproj ./
RUN dotnet restore

# Copy source code
COPY . ./

# Build the specific project, not the solution
RUN dotnet publish *.csproj -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 80

# Se o nome do assembly seguir o csproj e contiver '-', mantenha; se você quer padronizar, sanitize aqui também.
ENTRYPOINT ["dotnet", "backend-smart-flow-pj-back.dll"]
# Alternativa (se você trocar o AssemblyName no csproj): ENTRYPOINT ["dotnet", "backend.smart.flow.pj.back.dll"]
