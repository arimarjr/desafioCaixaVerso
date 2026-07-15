namespace Application.DTOs;

/// <summary>
/// DTO para resposta de chat. Contém a resposta gerada pelo modelo de linguagem.
/// </summary>
public class ChatResponse
{
    public string Resposta { get; set; } = null!;
}