import db from "../config/mysqlConfig";

class ordersRepo {

  // 🔥 CREATE ORDER
  static async placeOrder(user_id: string, data: any, callback: any) {
    // console.log("Placing order for user:", user_id, "with data:", data);
    const connection = await db.getConnection();

    try {
      const {
        items,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_pincode,
      } = data;

      if (!user_id || !items || items.length === 0) {
        return callback({
          apiSuccess: 0,
          message: "Invalid order data",
        });
      }

      const order_id = `ORD${Date.now()}`;

      const total_amount = items.reduce(
        (sum: number, item: any) =>
          sum + item.price * item.quantity,
        0
      );

      await connection.beginTransaction();

      const orderQuery = `
        INSERT INTO orders (
          order_id,
          user_id,
          total_amount,
          order_status,
          payment_status,
          shipping_name,
          shipping_phone,
          shipping_address,
          shipping_city,
          shipping_pincode
        ) VALUES (?, ?, ?, 'PLACED', 'PENDING', ?, ?, ?, ?, ?)
      `;

      await connection.execute(orderQuery, [
        order_id,
        user_id,
        total_amount,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_pincode,
      ]);

      const itemQuery = `
        INSERT INTO order_items (
          order_id,
          volume_id,
          seller_id,
          volume_title,
          price_at_purchase,
          quantity
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      for (const item of items) {
        await connection.execute(itemQuery, [
          order_id,
          item.volume_id,
          item.seller_id,
          item.volume_title,
          item.price,
          item.quantity,
        ]);
      }

      await connection.commit();

      return callback({
        apiSuccess: 1,
        message: "Order created successfully",
        order_id,
      });

    } catch (error) {
      await connection.rollback();
      console.error("Error creating order:", error);

      return callback({
        apiSuccess: 0,
        message: "Failed to create order",
      });

    } finally {
      connection.release();
    }
  }

  static async getOrders(user_id: string, callback: any) {
    try {
      const query = `
        SELECT 
          o.order_id,
          o.user_id,
          o.total_amount,
          o.order_status,
          o.payment_status,
          o.shipping_name,
          o.shipping_phone,
          o.shipping_address,
          o.shipping_city,
          o.shipping_pincode,
          o.created_at AS order_created_at,

          oi.id AS item_id,
          oi.volume_id,
          oi.seller_id,
          oi.volume_title,
          oi.price_at_purchase,
          oi.quantity,
          oi.created_at AS item_created_at

        FROM orders o
        LEFT JOIN order_items oi
          ON o.order_id = oi.order_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `;

      const [rows]: any = await db.execute(query, [user_id]);

      const ordersMap: any = {};

      for (const row of rows) {
        if (!ordersMap[row.order_id]) {
          ordersMap[row.order_id] = {
            order_id: row.order_id,
            user_id: row.user_id,
            total_amount: row.total_amount,
            order_status: row.order_status,
            payment_status: row.payment_status,
            shipping_name: row.shipping_name,
            shipping_phone: row.shipping_phone,
            shipping_address: row.shipping_address,
            shipping_city: row.shipping_city,
            shipping_pincode: row.shipping_pincode,
            created_at: row.order_created_at,
            orderItems: [],
          };
        }

        if (row.item_id) {
          ordersMap[row.order_id].orderItems.push({
            id: row.item_id,
            order_id: row.order_id,
            volume_id: row.volume_id,
            seller_id: row.seller_id,
            volume_title: row.volume_title,
            price_at_purchase: row.price_at_purchase,
            quantity: row.quantity,
            created_at: row.item_created_at,
          });
        }
      }

      return callback({
        apiSuccess: 1,
        orders: Object.values(ordersMap),
        message: "orders retrieved successfully",
      });

    } catch (error) {
      console.error("Error fetching orders:", error);

      return callback({
        apiSuccess: 0,
        message: "Failed to retrieve orders",
      });
    }
  }

  static async getOrderDetails(order_id: string, callback: any) {
    try {
      const query = `
        SELECT 
          o.order_id,
          o.user_id,
          o.total_amount,
          o.order_status,
          o.payment_status,
          o.shipping_name,
          o.shipping_phone,
          o.shipping_address,
          o.shipping_city,
          o.shipping_pincode,
          o.created_at AS order_created_at,

          oi.id AS item_id,
          oi.volume_id,
          oi.seller_id,
          oi.volume_title,
          oi.price_at_purchase,
          oi.quantity,
          oi.created_at AS item_created_at

        FROM orders o
        LEFT JOIN order_items oi
          ON o.order_id = oi.order_id
        WHERE o.order_id = ?
      `;

      const [rows]: any = await db.execute(query, [order_id]);
      console.log("Fetched order details:", rows);

      if (!rows || rows.length === 0) {
        return callback({
          apiSuccess: 0,
          message: "Order not found",
        });
      }

      const orderDetails = {
        order_id: rows[0].order_id,
        user_id: rows[0].user_id,
        total_amount: rows[0].total_amount,
        order_status: rows[0].order_status,
        payment_status: rows[0].payment_status,
        shipping_name: rows[0].shipping_name,
        shipping_phone: rows[0].shipping_phone,
        shipping_address: rows[0].shipping_address,
        shipping_city: rows[0].shipping_city,
        shipping_pincode: rows[0].shipping_pincode,
        created_at: rows[0].order_created_at,
        orderItems: [] as any[],
      };

      for (const row of rows) {
        if (row.item_id) {
          orderDetails.orderItems.push({
            id: row.item_id,
            order_id: row.order_id,
            volume_id: row.volume_id,
            seller_id: row.seller_id,
            volume_title: row.volume_title,
            price_at_purchase: row.price_at_purchase,
            quantity: row.quantity,
            created_at: row.item_created_at,
          });
        }
      }

      return callback({
        apiSuccess: 1,
        order: orderDetails,
        message: "Order details retrieved successfully",
      });

    } catch (error) {
      console.error("Error fetching order details:", error);

      return callback({
        apiSuccess: 0,
        message: "Failed to retrieve order details",
      });
    }
  }
}

export default ordersRepo;