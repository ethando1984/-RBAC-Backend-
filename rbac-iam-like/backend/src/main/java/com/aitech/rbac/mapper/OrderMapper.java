package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Order;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface OrderMapper {
    @Select("SELECT * FROM orders")
    List<Order> findAll();

    @Select("SELECT * FROM orders WHERE order_id = #{id}")
    Order findById(UUID id);

    @Insert("INSERT INTO orders(order_id, customer_name, total_amount, status, order_date) " +
            "VALUES(#{orderId}, #{customerName}, #{totalAmount}, #{status}, #{orderDate})")
    void insert(Order order);

    @Update("UPDATE orders SET customer_name=#{customerName}, total_amount=#{totalAmount}, " +
            "status=#{status} WHERE order_id=#{orderId}")
    void update(Order order);

    @Delete("DELETE FROM orders WHERE order_id=#{id}")
    void delete(UUID id);
}
