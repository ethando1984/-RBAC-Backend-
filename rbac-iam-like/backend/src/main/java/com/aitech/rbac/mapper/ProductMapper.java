package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Product;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface ProductMapper {
        List<Product> findAll();

        Product findById(UUID id);

        void insert(Product product);

        void update(Product product);

        void delete(UUID id);
}
