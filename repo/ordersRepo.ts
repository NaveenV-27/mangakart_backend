import mysqlPool from "../config/mysqlConfig";
import util from "util";

const queryAsync = util.promisify(mysqlPool.query).bind(mysqlPool);

class ordersRepo {
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

      const rows: any = await queryAsync({
        sql: query,
        values: [user_id],
      });

      const ordersMap: any = {};

      for (const row of rows) {
        // Create order if not exists
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
            orderItems: [], // 👈 nested items
          };
        }

        // Push item if exists
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
}

export default ordersRepo;