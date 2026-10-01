SNEHASAKHI COLLECTION - READY FULL-STACK MERN PROJECT

FEATURES
1. React frontend
2. Express.js backend
3. MongoDB + Mongoose
4. Product collection loaded from MongoDB
5. Add to Cart
6. Increase/decrease quantity
7. Checkout form
8. Place Order
9. Orders stored in MongoDB in an "orders" collection
10. GET /api/orders for viewing saved orders

REQUIREMENTS
- Node.js
- MongoDB running locally
- VS Code or another editor

IMPORTANT
This project uses the existing MongoDB database:
snehasakhiDB
and existing collection:
jewellery

RUN BACKEND
1. Open terminal.
2. Go to the server folder:
   cd experiment-9/server
3. Install packages:
   npm install
4. Start server:
   node server.js

Backend:
http://localhost:3002

RUN FRONTEND
1. Open a second terminal.
2. Go to client:
   cd experiment-9/client
3. Install packages:
   npm install
4. Start React:
   npm run dev

Frontend:
http://localhost:5173

ORDER FLOW
1. Open the website.
2. Click Add to Cart on any product.
3. Click Cart.
4. Adjust quantity if required.
5. Click Proceed to Checkout.
6. Enter name, phone, address and city.
7. Select payment method.
8. Click Place Order.
9. The order is saved in MongoDB database snehasakhiDB, collection orders.

VIEW ORDERS
Open:
http://localhost:3002/api/orders

NOTE
This is a college-project/demo ordering system. It does not process real online payments. The included payment options are demonstration options only.
