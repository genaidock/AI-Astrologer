import asyncio
from llm.client import chat_completion
import config
print(f"Model configured: {config.CODECRAFT_MODEL}")
async def test():
    stream = await chat_completion([{'role':'user','content':'hello'}], stream=True)
    async for chunk in stream:
        print(chunk, end='', flush=True)

asyncio.run(test())
