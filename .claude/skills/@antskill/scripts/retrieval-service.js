#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * 知识库检索工具
 * 用于从外部知识库检索相关信息
 */
let query;
// 检查是否提供了查询参数
const fileArgIndex = process.argv.indexOf('--file');
const filePath = process.argv[fileArgIndex + 1];

if (filePath && fs.existsSync(filePath)) {
    query = fs.readFileSync(filePath, 'utf-8');
    // 执行 RAG 逻辑...
    // 可选：执行完后删除临时文件
    // fs.unlinkSync(filePath);
}
if (!query) {
  console.error('请提供查询参数，例如: node retrieval-service.js "查询内容"');
  process.exit(1);
}

/**
 * 获取配置信息 - 从环境变量或默认值
 */
async function getRAGConfig() {
  // 尝试加载 .env 文件（从用户项目根目录读取）
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  }
  
  const baseUrl = process.env.RAG_BASE_URL || 'https://whisker.antgroup-inc.cn';
  const ragApiKey = process.env.RAG_API_KEY || '';
  
  return {
    baseUrl,
    ragApiKey,
    ragEmbeddingModel: 'bge-base-chinese-1117',
    similarityThreshold: 0.6,
    retrievalType: 'deep_retrieval',
    topK: 10,
    timeout: 30000
  };
}

/**
 * 通用的 HTTP 请求方法
 */
async function makeRequest(
  url,
  method = 'GET',
  payload,
  additionalHeaders = {},
) {
  // 设置默认请求头
  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    ...additionalHeaders,
  };

  const config = await getRAGConfig();
  // 如果有 API Key，添加认证头
  if (config.ragApiKey) {
    headers.Authorization = `Bearer ${config.ragApiKey}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
      signal: AbortSignal.timeout(config.timeout), // 使用配置的超时时间
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
    const errorText = await response.text();
    console.error(`请求失败: ${response.status} - ${errorText}`);
    throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
  } catch (error) {
    console.error(`请求异常: ${error}`);
    throw error;
  }
}

/**
 * 从知识库检索内容
 */
async function retrieveKnowledge({
  content,
  // spaceIdList,
  topK = 10,
  embeddingModelName = 'bge_code_v1',
  similarityThreshold = 0.6,
  retrievalType = 'deep_retrieval',
}) {
  const config = await getRAGConfig();
  const url = `${config.baseUrl}/api/retrieval/`;

  // 构建请求体，模拟 curl 的格式
  const payload = {
    config: {
      embedding_model_name: embeddingModelName,
      question: '', // 根据 curl 示例，这里是空字符串
      // space_id_list: spaceIdList,
      top: topK,
      similarity_threshold: similarityThreshold,
      type: retrievalType,
      show_embedding: false,
    },
    content,
  };

  try {
    const result = await makeRequest(url, 'POST', payload);
    return parseResponse(result);
  } catch (error) {
    throw error;
  }
}

/**
 * 解析响应数据
 */
function parseResponse(responseData) {
  // 直接返回原始响应数据
  if (Array.isArray(responseData)) {
    return responseData;
  }
  if (typeof responseData === 'object' && responseData !== null) {
    // 尝试常见的数据字段
    const fields = [ 'data', 'results', 'chunks', 'documents', 'items' ];
    for (const field of fields) {
      if (field in responseData && Array.isArray(responseData[field])) {
        return responseData[field];
      }
    }
    // 如果没找到，返回包装后的单个元素
    return [ responseData ];
  }
  return [{ content: String(responseData) }];
}

/**
 * 获取知识库检索结果
 */
async function getKnowledgeChunks(query, topK = 10) {
  const config = await getRAGConfig();
  
  // 检查必要的配置
  if (!config.ragApiKey) {
    console.error('❌ 错误: 未配置 API Key');
    console.error('');
    console.error('🔧 配置方法（选择一种）：');
    console.error('   1. 创建 .env 文件：');
    console.error('      echo "RAG_API_KEY=your-actual-api-key" > .env');
    console.error('');
    console.error('   2. 设置环境变量：');
    console.error('      export RAG_API_KEY="your-actual-api-key"');
    console.error('');
    console.error('   3. 永久配置（添加到 shell 配置）：');
    console.error('      echo "export RAG_API_KEY=your-actual-api-key" >> ~/.bashrc');
    console.error('      source ~/.bashrc');
    process.exit(1);
  }
  
  try {
    const chunks = await retrieveKnowledge({
      content: query,
      topK: topK || config.topK,
      embeddingModelName: config.ragEmbeddingModel,
      similarityThreshold: config.similarityThreshold,
      retrievalType: config.retrievalType,
    });
    return chunks;
  } catch (error) {
    console.error(`知识库检索失败: ${error}`);
    throw error;
  }
}

/**
 * 格式化输出结果
 */
function formatOutput(chunks) {
  if (!chunks || chunks.length === 0) {
    return '未找到相关知识库信息';
  }

  // 组织检索结果
  let result = `知识库检索结果 (共 ${chunks.length} 条相关信息):\n\n`;

  chunks.forEach((chunk, index) => {
    if (!chunk) {
      return;
    }

    const { context, content, similarity } = chunk;
    const chunkContent = context || content || '无内容';

    // 处理score为undefined的情况
    const scoreText = similarity !== undefined ? similarity.toFixed(3) : 'N/A';

    result += `[${index + 1}] 相关度: ${scoreText}\n`;
    result += `内容: ${chunkContent}\n`;
    result += '-'.repeat(50) + '\n';
  });

  return result;
}

/**
 * 主函数
 */
async function main() {
  console.log(`正在检索与 "${query}" 相关的知识库信息...`);
  
  try {
    const chunks = await getKnowledgeChunks(query);
    const output = formatOutput(chunks);
    console.log(output);
  } catch (error) {
    console.error(`检索过程中发生错误: ${error}`);
    process.exit(1);
  }
}

// 执行主函数
main();