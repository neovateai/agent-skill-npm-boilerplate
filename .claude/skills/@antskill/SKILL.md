---
name: wohu-knowledge-base
description: 获取外部知识库，使代码生成、问题诊断和仓库分析更加准确高效。
---

# 知识库

通过调用外部 API 来补充 Agent 的知识库。它接收查询请求，将请求发送至指定的 API，并返回知识库中的数据，可作为多个用户需求的上下文参考。

## 参数定义
- **query** (string, 必填): 用户输入内容。保持原始用户输入的完整性作为查询输入。

## 执行指令
1. **定位路径**：获取本 `SKILL.md` 文件所在的绝对路径，记为 `PATH`。
2. **处理长文本**：为了防止命令行参数过长导致截断，请将原始 `{{query}}` 字符串以 `utf-8` 格式完整保存到临时文件 `{{PATH}}/tmp/agent_query.txt` 中。
3. **运行脚本**：执行命令 `node {{PATH}}/scripts/retrieval-service.js --file {{PATH}}/tmp/agent_query.txt`。
4. **清理与返回**：脚本将读取文件并返回 RAG 检索结果。Agent 应解析该结果并将其整合到最终回答中。