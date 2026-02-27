// obfuscate-form.js
const { execSync } = require("child_process");
const glob = require("glob");
const path = require("path");

const files = glob.sync("js/form-*-nude.js");

if (files.length === 0) {
  console.log("⚠️  처리할 form-*-nude.js 파일이 없습니다.");
  process.exit(0);
}

files.forEach((file) => {
  const outFile = file.replace("-nude.js", ".js");

  console.log(`➡️  난독화: ${file} → ${outFile}`);

  execSync(
    `javascript-obfuscator ${file} --output ${outFile} \
    --compact true \
    --self-defending true \
    --string-array true \
    --string-array-threshold 1 \
    --string-array-encoding base64 \
    --control-flow-flattening true \
    --control-flow-flattening-threshold 0.8 \
    --dead-code-injection true \
    --dead-code-injection-threshold 0.2 \
    --numbers-to-expressions true \
    --identifier-names-generator mangled \
    --split-strings true \
    --split-strings-chunk-length 5`,
    { stdio: "inherit" }
  );
});

console.log("✅ 모든 form-*-nude.js 난독화 완료");
