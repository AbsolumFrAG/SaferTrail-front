import { analytics } from "./analytics";

interface ErrorReport {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
  userId?: string;
}

class ErrorReporter {
  private errors: ErrorReport[] = [];
  private maxErrors = 50;

  report(error: Error, context?: Record<string, any>): void {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    };

    this.errors.push(report);

    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // In production, send to crash reporting service
    if (__DEV__) {
      console.error("Error Report:", report);
    } else {
      // Send to crash reporting service (Sentry, Crashlytics, etc.)
      this.sendToCrashReporting(report);
    }
  }

  private async sendToCrashReporting(report: ErrorReport): Promise<void> {
    // Implementation depends on your crash reporting service
    // Example for a generic HTTP endpoint:
    try {
      await fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });
    } catch (err) {
      console.error("Failed to send error report:", err);
    }
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  clear(): void {
    this.errors = [];
  }
}

export const errorReporter = new ErrorReporter();

// Enhanced error boundary usage
export const reportError = (
  error: Error,
  context?: Record<string, any>
): void => {
  errorReporter.report(error, context);
  analytics.track("error_occurred", {
    error_message: error.message,
    ...context,
  });
};

export default errorReporter;