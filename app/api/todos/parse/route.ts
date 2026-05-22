import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

export async function POST(req: NextRequest) {
  try {
    const { text, accessToken, imageUrl } = await req.json()

    if (!accessToken) {
      return NextResponse.json({ error: '缺少认证信息' }, { status: 400 })
    }

    if (!text?.trim() && !imageUrl) {
      return NextResponse.json({ error: '请提供文本或图片' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    )

    // 构建用户消息：支持纯文本、纯图片、文本+图片
    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = []

    if (text?.trim()) {
      userContent.push({
        type: 'text',
        text: `请从以下内容中提取待办事项：\n${text}`,
      })
    }

    if (imageUrl) {
      userContent.push({
        type: 'image_url',
        image_url: { url: imageUrl },
      })
    }

    if (!text?.trim() && imageUrl) {
      // 纯图片场景：添加提取指令
      userContent.unshift({
        type: 'text',
        text: '请从这张图片中提取所有待办事项。',
      })
    }

    const completion = await openai.chat.completions.create({
      model: 'qwen-vl-ocr-latest',
      messages: [
        {
          role: 'system',
          content: `你是一个待办事项解析助手。用户会提供文本和/或图片，你需要从中提取所有待办事项。
严格按照以下JSON格式返回，不要包含markdown代码块标记：
[{"text": "事项内容", "priority": "medium"}]

规则：
- 只提取用户明确提到或图片中明确写出的待办事项
- 以原文和源语言显示事项内容，不要翻译、不要添加额外解释或修饰
- priority 可选值：low（低优先级）、medium（中优先级）、high（高优先级）
- 根据事项的紧急程度和重要性判断优先级
- 如果包含多个事项，返回多个对象
- 如果只有一个事项，返回单个对象的数组
- 只返回JSON数组，不要有任何解释或其他文字`,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content?.trim() || '[]'

    let jsonStr = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    let todos: { text: string; priority: string }[]
    try {
      todos = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: 'AI解析失败，请重试' }, { status: 500 })
    }

    if (!Array.isArray(todos) || todos.length === 0) {
      return NextResponse.json({ error: '未能解析出待办事项' }, { status: 400 })
    }

    const insertData = todos.map((todo, index) => ({
      text: todo.text,
      priority: ['low', 'medium', 'high'].includes(todo.priority)
        ? todo.priority
        : 'medium',
      completed: false,
      image_url: index === 0 ? imageUrl || null : null,
    }))

    const { data, error } = await supabase
      .from('todos')
      .insert(insertData)
      .select()

    if (error) {
      console.error('[/api/todos/parse] insert error:', error)
      return NextResponse.json({ error: '插入数据失败' }, { status: 500 })
    }

    return NextResponse.json({ todos: data })
  } catch (err) {
    console.error('[/api/todos/parse]', err)
    const message = err instanceof Error ? err.message : '服务器错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
