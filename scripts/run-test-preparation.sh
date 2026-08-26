#!/bin/bash

# SEO Copilot v1.1.0 - 快速测试启动脚本
# 用于验证扩展构建状态并准备测试环境

echo "======================================"
echo "SEO Copilot v1.1.0 测试准备"
echo "======================================"
echo ""

# 1. 检查版本号
echo "📋 步骤 1: 检查版本号..."
MANIFEST_VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
PACKAGE_VERSION=$(grep -o '"version": "[^"]*"' package.json | head -1 | cut -d'"' -f4)

echo "  - manifest.json: $MANIFEST_VERSION"
echo "  - package.json: $PACKAGE_VERSION"

if [ "$MANIFEST_VERSION" != "1.1.0" ] || [ "$PACKAGE_VERSION" != "1.1.0" ]; then
    echo "  ⚠️  警告: 版本号不一致或不是 1.1.0"
else
    echo "  ✅ 版本号验证通过"
fi
echo ""

# 2. 运行测试套件
echo "🧪 步骤 2: 运行测试套件..."
npm test
TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo "  ✅ 所有测试通过"
else
    echo "  ❌ 测试失败，请先修复测试问题"
    exit 1
fi
echo ""

# 3. 执行生产构建
echo "🔨 步骤 3: 执行生产构建..."
npm run build
BUILD_RESULT=$?

if [ $BUILD_RESULT -eq 0 ]; then
    echo "  ✅ 构建成功"
else
    echo "  ❌ 构建失败"
    exit 1
fi
echo ""

# 4. 验证构建产物
echo "📦 步骤 4: 验证构建产物..."
if [ -f "dist/manifest.json" ]; then
    echo "  ✅ manifest.json 存在"
else
    echo "  ❌ manifest.json 缺失"
    exit 1
fi

if [ -f "dist/index.html" ]; then
    echo "  ✅ index.html 存在"
else
    echo "  ❌ index.html 缺失"
    exit 1
fi

if [ -d "dist/assets" ]; then
    echo "  ✅ assets 目录存在"
else
    echo "  ❌ assets 目录缺失"
    exit 1
fi

if [ -d "dist/icons" ]; then
    echo "  ✅ icons 目录存在"
else
    echo "  ❌ icons 目录缺失"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ 测试准备完成！"
echo "======================================"
echo ""
echo "📖 下一步操作："
echo ""
echo "1. 加载扩展到 Chrome:"
echo "   - 打开 chrome://extensions/"
echo "   - 启用 '开发者模式'"
echo "   - 点击 '加载已解压的扩展程序'"
echo "   - 选择项目的 'dist' 目录"
echo ""
echo "2. 开始测试:"
echo "   - 打开 TEST_REGRESSION_MATRIX.md"
echo "   - 按照 TEST_EXECUTION_GUIDE.md 的指引执行测试"
echo "   - 逐个测试 20 个网站"
echo ""
echo "3. 测试重点:"
echo "   ✓ 扫描成功率"
echo "   ✓ 控制台错误"
echo "   ✓ 评分生成"
echo "   ✓ Schema 解析"
echo "   ✓ 性能表现"
echo ""
echo "📄 相关文档:"
echo "   - TEST_REGRESSION_MATRIX.md    (测试矩阵和记录表)"
echo "   - TEST_EXECUTION_GUIDE.md      (详细执行指南)"
echo ""
echo "🎯 目标: 至少 18/20 网站扫描成功 (90%)"
echo ""
