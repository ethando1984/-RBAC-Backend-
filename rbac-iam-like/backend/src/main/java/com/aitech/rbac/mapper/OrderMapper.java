package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Order;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface OrderMapper {
        List<Order> findAll();

        Order findById(UUID id);

        void insert(Order order);

        void update(Order order);

        void delete(UUID id);
}
