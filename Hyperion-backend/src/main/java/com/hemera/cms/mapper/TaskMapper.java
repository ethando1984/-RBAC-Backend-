package com.hemera.cms.mapper;

import com.hemera.cms.model.Task;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface TaskMapper {

        @Select("SELECT * FROM tasks WHERE id = #{id}")
        Task findById(UUID id);

        @Select("<script>" +
                        "SELECT * FROM tasks " +
                        "<where>" +
                        "<if test='status != null'>status = #{status}</if> " +
                        "<if test='assignedToUserId != null'>AND assigned_to_user_id = #{assignedToUserId}</if> " +
                        "<if test='createdByUserId != null'>AND created_by_user_id = #{createdByUserId}</if> " +
                        "<if test='articleId != null'>AND article_id = #{articleId}</if> " +
                        "</where>" +
                        "ORDER BY " +
                        "CASE priority " +
                        "WHEN 'URGENT' THEN 1 " +
                        "WHEN 'HIGH' THEN 2 " +
                        "WHEN 'MEDIUM' THEN 3 " +
                        "ELSE 4 END, " +
                        "due_date ASC NULLS LAST, created_at DESC " +
                        "LIMIT #{size} OFFSET #{offset}" +
                        "</script>")
        List<Task> findAll(
                        @Param("status") String status,
                        @Param("assignedToUserId") String assignedToUserId,
                        @Param("createdByUserId") String createdByUserId,
                        @Param("articleId") UUID articleId,
                        @Param("offset") int offset,
                        @Param("size") int size);

        @Insert("INSERT INTO tasks (id, title, description, status, priority, assigned_to_user_id, assigned_to_email, "
                        +
                        "article_id, due_date, created_by_user_id, created_by_email, created_at) " +
                        "VALUES (#{id}, #{title}, #{description}, #{status}, #{priority}, #{assignedToUserId}, #{assignedToEmail}, "
                        +
                        "#{articleId}, #{dueDate}, #{createdByUserId}, #{createdByEmail}, #{createdAt})")
        void insert(Task task);

        @Update("UPDATE tasks SET title=#{title}, description=#{description}, status=#{status}, priority=#{priority}, "
                        +
                        "assigned_to_user_id=#{assignedToUserId}, assigned_to_email=#{assignedToEmail}, article_id=#{articleId}, "
                        +
                        "due_date=#{dueDate}, completed_at=#{completedAt}, updated_by_user_id=#{updatedByUserId}, " +
                        "updated_by_email=#{updatedByEmail}, updated_at=#{updatedAt} WHERE id=#{id}")
        void update(Task task);

        @Delete("DELETE FROM tasks WHERE id = #{id}")
        void delete(UUID id);

        @Select("SELECT COUNT(*) FROM tasks WHERE status = #{status}")
        int countByStatus(@Param("status") String status);
}
