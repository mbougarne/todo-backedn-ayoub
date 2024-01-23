# السلام عليكم

هذو هما روابط لي خاص تعامل معاهم من رياكت

- http://localhost:5500//api/v1/users/signup METHOD POST
- http://localhost:5500//api/v1/users/login METHOD POST
- http://localhost:5500//api/v1/users/update METHOD PUT
- http://localhost:5500//api/v1/users/destroy METHOD DELETE
- http://localhost:5500//api/v1/todos/ METHOD GET
- http://localhost:5500//api/v1/todos/:todoID METHOD GET
- http://localhost:5500//api/v1/todos/create METHOD POST
- http://localhost:5500//api/v1/todos/update/:todoID METHOD PUT
- http://localhost:5500//api/v1/todos/completed/:todoID METHOD PUT 
- http://localhost:5500//api/v1/todos/destroy/:todoID METHOD DELETE

### كيفاش تخدم بيها

أول حاجة ديرها هي تقاد database sqlite
```bash
yarn db:migrate
```
ثاني حاجة

```bash
yarn run:dev
```
