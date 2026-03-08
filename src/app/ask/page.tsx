"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2, Lightbulb } from "lucide-react";

interface QueryResult {
  answer: string;
  reasoning: string;
  confidence: string;
}

interface HistoryItem {
  id: string;
  question: string;
  createdAt: string;
  response: { answer: string; confidence: string | null } | null;
}

const sampleQuestions = [
  "Summarize my current health status.",
  "What supplements am I currently taking?",
  "What changed in the last 14 days?",
  "Which health metrics are worsening?",
  "What should I prioritize this week?",
  "Show me possible correlations between my meals and symptoms.",
  "Did my sleep improve recently?",
  "What data am I missing to make better recommendations?",
  "Compare my energy levels with sleep quality.",
  "Which protocols are currently active?",
  "Give me a recommendation based on my current data.",
  "What are my biggest health risks right now?",
];

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetch("/api/ai-query?history=true")
      .then(r => r.json())
      .then(setHistory)
      .catch(() => {});
  }, [result]);

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ answer: "An error occurred. Please try again.", reasoning: "", confidence: "low" });
    }
    setLoading(false);
  }

  function handleSampleClick(q: string) {
    setQuestion(q);
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ask My Data</h1>
        <p className="text-muted-foreground text-sm">
          Ask questions about your health data in plain English
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about your health data..."
                className="min-h-[100px] pr-16 text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
              />
              <Button
                size="icon"
                className="absolute bottom-3 right-3"
                onClick={handleAsk}
                disabled={loading || !question.trim()}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Questions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-400" /> Try asking...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSampleClick(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground transition"
              >
                {q}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Response
              <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-[10px]">
                {result.confidence} confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
              {result.answer}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.slice(0, 10).map((h) => (
              <div key={h.id} className="border-b border-border pb-3 last:border-0">
                <button
                  onClick={() => handleSampleClick(h.question)}
                  className="text-sm font-medium text-left hover:text-primary transition w-full"
                >
                  {h.question}
                </button>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(h.createdAt).toLocaleDateString()}
                  {h.response?.confidence && (
                    <span className="ml-2">Confidence: {h.response.confidence}</span>
                  )}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
