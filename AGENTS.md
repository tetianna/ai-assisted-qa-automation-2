## Atlassian Rovo MCP

When connected to `atlassian-rovo-mcp`:

- **MUST** use Jira project key = DS
- **MUST** use cloudId = "https://legionqaschool.atlassian.net" (do NOT call getAccessibleAtlassianResources)
- **MUST** use `maxResults: 10` or `limit: 10` for ALL Jira JQL and Confluence CQL search operations.
