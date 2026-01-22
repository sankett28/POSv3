"""Structured logging configuration with JSON formatting."""
import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging.
    
    Outputs log records as JSON objects with timestamp, level, message,
    and additional context fields. This format is ideal for log aggregation
    systems and makes it easier to search and analyze logs.
    
    Validates: Requirement 6.5
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as JSON string.
        
        Args:
            record: Log record to format
        
        Returns:
            JSON-formatted log string
        """
        log_data: Dict[str, Any] = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, 'function'):
            log_data['operation'] = record.function
        if hasattr(record, 'error_type'):
            log_data['error_type'] = record.error_type
        if hasattr(record, 'retry_count'):
            log_data['retry_count'] = record.retry_count
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'args_count'):
            log_data['args_count'] = record.args_count
        if hasattr(record, 'kwargs_keys'):
            log_data['kwargs_keys'] = record.kwargs_keys
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


def setup_logging(level: str = "INFO", use_json: bool = True) -> None:
    """
    Configure application logging with optional JSON formatting.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        use_json: Whether to use JSON formatting (default: True)
    
    Examples:
        >>> # Use JSON formatting (production)
        >>> setup_logging(level="INFO", use_json=True)
        
        >>> # Use plain text formatting (development)
        >>> setup_logging(level="DEBUG", use_json=False)
    """
    handler = logging.StreamHandler(sys.stdout)
    
    if use_json:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        )
    
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        handlers=[handler]
    )


# Create logger instance
logger = logging.getLogger("pos_backend")

