package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Product;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface ProductMapper {
    @Select("SELECT * FROM products")
    List<Product> findAll();

    @Select("SELECT * FROM products WHERE product_id = #{id}")
    Product findById(UUID id);

    @Insert("INSERT INTO products(product_id, product_name, sku, price, stock_quantity, category) " +
            "VALUES(#{productId}, #{productName}, #{sku}, #{price}, #{stockQuantity}, #{category})")
    void insert(Product product);

    @Update("UPDATE products SET product_name=#{productName}, sku=#{sku}, price=#{price}, " +
            "stock_quantity=#{stockQuantity}, category=#{category} WHERE product_id=#{productId}")
    void update(Product product);

    @Delete("DELETE FROM products WHERE product_id=#{id}")
    void delete(UUID id);
}
