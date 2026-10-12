from typing import Optional
import os
from fastapi import FastAPI, HTTPException, Header, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="HTTP API Lab", version="1.0.0",
 description="Practice HTTP methods, JSON, query parameters, validation and headers.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class PostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=5000)
    userId: int = Field(gt=0)
class PostPatch(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    body: Optional[str] = Field(default=None, min_length=1, max_length=5000)
    userId: Optional[int] = Field(default=None, gt=0)

users = [
 {"id":1,"name":"Alex Morgan","username":"alexm","email":"alex@example.test","address":{"city":"Amsterdam"}},
 {"id":2,"name":"Sam Rivera","username":"samr","email":"sam@example.test","address":{"city":"Rotterdam"}},
 {"id":3,"name":"Jamie Chen","username":"jamiec","email":"jamie@example.test","address":{"city":"Utrecht"}},
]
posts = {
 1:{"id":1,"title":"Изучаем HTTP","body":"Первый запрос к API.","userId":1},
 2:{"id":2,"title":"Что такое JSON","body":"Объекты, массивы и типы данных.","userId":1},
 3:{"id":3,"title":"REST API на практике","body":"Отправляем запросы через Postman.","userId":2},
 4:{"id":4,"title":"Python requests","body":"Обрабатываем ответы сервера.","userId":2},
 5:{"id":5,"title":"Статус-коды HTTP","body":"Понимаем 200, 201, 404 и 422.","userId":3},
}
next_id = 6
API_KEY = os.getenv("DEMO_API_KEY", "lab-demo-key")

@app.get("/")
def root():
 return {"name":"HTTP API Lab","docs":"/docs","health":"/health","version":"1.0.0"}
@app.get("/health")
def health():
 return {"status":"ok","service":"http-api-lab"}
@app.get("/api/v1/posts")
def list_posts(userId: Optional[int]=Query(default=None, gt=0), q: Optional[str]=None,
               limit: int=Query(default=10,ge=1,le=100), offset: int=Query(default=0,ge=0)):
 items=list(posts.values())
 if userId is not None: items=[p for p in items if p["userId"]==userId]
 if q:
  needle=q.casefold()
  items=[p for p in items if needle in p["title"].casefold() or needle in p["body"].casefold()]
 return {"items":items[offset:offset+limit],"total":len(items),"limit":limit,"offset":offset}
@app.post("/api/v1/posts", status_code=201)
def create_post(payload: PostCreate):
 global next_id
 if not any(u["id"]==payload.userId for u in users):
  raise HTTPException(422, detail="userId must match an existing user")
 item={"id":next_id,**payload.model_dump()}; posts[next_id]=item; next_id+=1
 return item
@app.get("/api/v1/posts/{post_id}")
def get_post(post_id:int):
 if post_id not in posts: raise HTTPException(404,detail=f"Post {post_id} not found")
 return posts[post_id]
@app.put("/api/v1/posts/{post_id}")
def replace_post(post_id:int,payload:PostCreate):
 if post_id not in posts: raise HTTPException(404,detail=f"Post {post_id} not found")
 if not any(u["id"]==payload.userId for u in users): raise HTTPException(422,detail="Unknown userId")
 posts[post_id]={"id":post_id,**payload.model_dump()}; return posts[post_id]
@app.patch("/api/v1/posts/{post_id}")
def patch_post(post_id:int,payload:PostPatch):
 if post_id not in posts: raise HTTPException(404,detail=f"Post {post_id} not found")
 changes=payload.model_dump(exclude_unset=True)
 if "userId" in changes and not any(u["id"]==changes["userId"] for u in users):
  raise HTTPException(422,detail="Unknown userId")
 posts[post_id].update(changes); return posts[post_id]
@app.delete("/api/v1/posts/{post_id}",status_code=204)
def delete_post(post_id:int):
 if post_id not in posts: raise HTTPException(404,detail=f"Post {post_id} not found")
 del posts[post_id]; return Response(status_code=204)
@app.get("/api/v1/users")
def list_users(): return users
@app.get("/api/v1/users/{user_id}")
def get_user(user_id:int):
 for user in users:
  if user["id"]==user_id:return user
 raise HTTPException(404,detail=f"User {user_id} not found")
@app.get("/api/v1/secure/profile")
def secure_profile(x_api_key: Optional[str]=Header(default=None,alias="X-API-Key")):
 if x_api_key != API_KEY: raise HTTPException(401,detail="Missing or invalid X-API-Key")
 return {"authenticated":True,"profile":{"id":101,"username":"postman-learner","role":"student"}}
@app.get("/api/v1/status/{code}")
def status_practice(code:int):
 if code==200:return {"status":200,"message":"OK"}
 if code==201:return Response(content='{"status":201,"message":"Created"}',status_code=201,media_type="application/json")
 if code==204:return Response(status_code=204)
 if code in (400,401,403,404,418,429,500,503):raise HTTPException(code,detail=f"Practice response: HTTP {code}")
 raise HTTPException(422,detail="Try status codes 200, 201, 204, 400, 401, 403, 404, 418, 429, 500 or 503")
