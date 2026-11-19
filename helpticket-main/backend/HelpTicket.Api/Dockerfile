# Estágio 1: Build da aplicação .NET 10
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copia o csproj e restaura as dependências
COPY ["HelpTicket.Api.csproj", "./"]
RUN dotnet restore "HelpTicket.Api.csproj"

# Copia o restante do código e publica em modo Release
COPY . .
RUN dotnet publish "HelpTicket.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio 2: Imagem final leve (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# O Render usa a porta 8080 por padrão em imagens .NET 8+
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HelpTicket.Api.dll"]

