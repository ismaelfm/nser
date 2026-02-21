package ai

// Client handles communication with the OpenRouter API for LLM routing.
type Client struct {
	apiKey  string
	baseURL string
}

// NewClient creates a new OpenRouter API client.
func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:  apiKey,
		baseURL: "https://openrouter.ai/api/v1",
	}
}
