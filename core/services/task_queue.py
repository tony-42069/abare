"""
Background task queue for handling document processing.
"""
import asyncio
from typing import Dict, Any, Callable, Awaitable, TypeVar, Union, Optional
import logging
from datetime import datetime, timedelta
import json
from motor.motor_asyncio import AsyncIOMotorDatabase

T = TypeVar('T')

logger = logging.getLogger(__name__)

class TaskQueue:
    """Manages asynchronous background tasks."""
    
    def __init__(self, db: "AsyncIOMotorDatabase"):
        self.db = db
        self.tasks: Dict[str, asyncio.Task] = {}
        self.callbacks: Dict[str, Callable[[Dict[str, Any]], Awaitable[None]]] = {}
        
    async def add_task(
        self,
        task_id: str,
        coroutine: Awaitable[T],
        callback: Optional[Callable[[T], Awaitable[None]]] = None
    ) -> None:
        """Add a task to the queue."""
        try:
            # Create task record
            await self.db.tasks.insert_one({
                "task_id": task_id,
                "status": "pending",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            # Store callback if provided
            if callback:
                self.callbacks[task_id] = callback
            
            # Create and start task
            task = asyncio.create_task(self._run_task(task_id, coroutine))
            self.tasks[task_id] = task
            
            logger.info(f"Added task {task_id} to queue")
            
        except Exception as e:
            logger.error(f"Error adding task {task_id}: {str(e)}")
            await self._update_task_status(task_id, "error", error=str(e))
            raise
    
    async def _run_task(self, task_id: str, coroutine: Awaitable[T]) -> None:
        """Execute a task and handle its result."""
        try:
            # Update task status to running
            await self._update_task_status(task_id, "running")
            
            # Execute task
            result = await coroutine
            
            # Update task status to completed
            await self._update_task_status(task_id, "completed", result=result)
            
            # Execute callback if exists
            if task_id in self.callbacks:
                await self.callbacks[task_id](result)
                del self.callbacks[task_id]
            
            logger.info(f"Task {task_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error executing task {task_id}: {str(e)}")
            await self._update_task_status(task_id, "error", error=str(e))
            
        finally:
            # Clean up task
            if task_id in self.tasks:
                del self.tasks[task_id]
    
    async def _update_task_status(
        self,
        task_id: str,
        status: str,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> None:
        """Update task status in database."""
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if result is not None:
            update_data["result"] = result
        if error is not None:
            update_data["error"] = error
        
        await self.db.tasks.update_one(
            {"task_id": task_id},
            {"$set": update_data}
        )
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get current status of a task."""
        task = await self.db.tasks.find_one({"task_id": task_id})
        if not task:
            raise ValueError(f"Task {task_id} not found")
        return task
    
    async def cancel_task(self, task_id: str) -> None:
        """Cancel a running task."""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            
            await self._update_task_status(task_id, "cancelled")
            del self.tasks[task_id]
            
            if task_id in self.callbacks:
                del self.callbacks[task_id]
            
            logger.info(f"Task {task_id} cancelled")
        else:
            logger.warning(f"Task {task_id} not found in active tasks")
    
    async def cleanup_old_tasks(self, days: int = 7) -> None:
        """Clean up old completed tasks from database."""
        cutoff = datetime.utcnow() - timedelta(days=days)
        result = await self.db.tasks.delete_many({
            "status": {"$in": ["completed", "error", "cancelled"]},
            "updated_at": {"$lt": cutoff}
        })
        logger.info(f"Cleaned up {result.deleted_count} old tasks")
