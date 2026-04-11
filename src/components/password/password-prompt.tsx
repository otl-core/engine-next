"use client";

import type { PasswordPromptTexts } from "@otl-core/cms-types";
import { useState } from "react";

interface PasswordPromptProps {
  title?: string;
  message?: string;
  entityId: string;
  entityType: "page" | "entry" | "site";
  locale: string;
  texts?: PasswordPromptTexts;
}

export default function PasswordPrompt({
  title,
  message,
  entityId,
  entityType,
  locale,
  texts,
}: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = texts ?? {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/password-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          locale,
          password,
        }),
      });

      const data = await response.json();

      if (data.success && data.valid) {
        // Password correct, reload page to show content
        window.location.reload();
      } else {
        setError(
          t.incorrect_password ?? "Incorrect password. Please try again.",
        );
        setPassword("");
      }
    } catch (err) {
      setError(t.error_message ?? "An error occurred. Please try again.");
      console.error("Password verification error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-md w-full bg-card text-card-foreground p-8 rounded-lg shadow-lg border border-border">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground mb-2">
            {title || t.default_title || "Protected Content"}
          </h1>
          {message && <p className="text-muted-foreground">{message}</p>}
          {!message && (
            <p className="text-muted-foreground">
              {t.default_message ??
                "This content is password protected. Please enter the password to view it."}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {t.password_label ?? "Password"}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t.password_placeholder ?? "Enter password"}
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full bg-primary text-primary-foreground font-medium py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? (t.verifying_label ?? "Verifying...")
              : (t.submit_label ?? "Submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
