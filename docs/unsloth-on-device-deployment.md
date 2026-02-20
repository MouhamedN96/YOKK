# Unsloth On-Device Deployment Guide

This guide extracts the phone/on-device deployment workflow from local Unsloth notebooks and adapts it for Yaatal Engine planning.

## Source Notebooks

- `Gemma3_(270M)_Phone_Deployment.ipynb`  
  Public source: `https://github.com/unslothai/notebooks/blob/main/nb/Gemma3_(270M)_Phone_Deployment.ipynb`
- `Qwen3_(0_6B)_Phone_Deployment.ipynb`  
  Public source: `https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_(0_6B)_Phone_Deployment.ipynb`
- `Qwen3_(0.6B)-Reasoning-Conversational-ExecuTorch.ipynb`  
  Public source: `https://github.com/unslothai/notebooks/blob/main/nb/Qwen3_(0.6B)-Reasoning-Conversational-ExecuTorch.ipynb`

## Additional Reference

- `zeroclaw` repository: `https://github.com/zeroclaw-labs/zeroclaw`

## What This Covers

- Fine-tune for mobile-friendly quantized export (QAT path)
- Export to ExecuTorch `.pte`
- Local smoke-test inference before app integration

## 1) Environment Setup

Use a CUDA runtime (the source notebooks use free Colab T4) and install:

```bash
pip install unsloth
pip install transformers==4.57.3
pip install --no-deps trl==0.25.1
pip install torchao==0.14.0 optimum==1.24.0 pytorch-tokenizers executorch
pip install git+https://github.com/huggingface/optimum-executorch.git@v0.1.0 --no-deps
```

Notes:

- The ExecuTorch-focused Qwen notebook also shows `transformers==4.56.2` with `trl==0.22.2`.
- Keep versions pinned per chosen notebook path.

## 2) Load Model for QAT

Qwen (phone-deployment preset):

```python
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen3-0.6B",
    max_seq_length=1024,
    full_finetuning=True,
    qat_scheme="phone-deployment",
)
```

Qwen (explicit ExecuTorch CPU quantization):

```python
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen3-0.6B",
    max_seq_length=2048,
    full_finetuning=True,
    qat_scheme="int8-int4",
)
```

Gemma 3 270M:

```python
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/gemma-3-270m-it",
    max_seq_length=2048,
    load_in_4bit=False,
    full_finetuning=True,
    qat_scheme="int4",
)
```

## 3) Data Strategy (From Notebooks)

- Gemma path: `mlabonne/FineTome-100k` -> chat-templated text.
- Qwen path: mix reasoning + non-reasoning:
- `unsloth/OpenMathReasoning-mini` (reasoning traces)
- `mlabonne/FineTome-100k` (chat)
- Example ratio in notebook: `75% reasoning / 25% chat`.

## 4) Train With a Sanity Pass First

The notebook pattern is:

- Run a short sanity train (`max_steps` around `60-100`).
- Confirm export works.
- Then run full training (`num_train_epochs=1` or `max_steps=-1`).

## 5) Save Trained Model

Qwen path:

```python
model.save_pretrained_torchao("phone_model", tokenizer=tokenizer)
```

Gemma path:

```python
model.save_pretrained("gemma_phone_model")
tokenizer.save_pretrained("gemma_phone_model")
```

## 6) Export to ExecuTorch

### Option A: Qwen export flow (executorch CLI)

Convert weights:

```bash
python -m executorch.examples.models.qwen3.convert_weights \
  phone_model pytorch_model_converted.bin
```

Fetch config:

```bash
curl -L -o 0.6B_config.json \
  https://raw.githubusercontent.com/pytorch/executorch/main/examples/models/qwen3/config/0_6b_config.json
```

Export `.pte`:

```bash
python -m executorch.examples.models.llama.export_llama \
  --model qwen3_0_6b \
  --checkpoint pytorch_model_converted.bin \
  --params 0.6B_config.json \
  --output_name qwen3_0.6B_model.pte \
  -kv \
  --use_sdpa_with_kv_cache \
  -X \
  --xnnpack-extended-ops \
  --max_context_length 1024 \
  --max_seq_length 128 \
  --dtype fp32 \
  --metadata '{"get_bos_id":199999, "get_eos_ids":[200020,199999]}'
```

### Option B: Gemma export flow (optimum-executorch API)

```python
from optimum.executorch import ExecuTorchModelForCausalLM

et_model = ExecuTorchModelForCausalLM.from_pretrained(
    "gemma_phone_model",
    export=True,
    recipe="xnnpack",
    task="text-generation",
)
```

Copy generated export artifact(s) from `et_model._temp_dir.name` into a stable output folder.

## 7) Smoke-Test Export Before Mobile Integration

Gemma notebook test pattern:

```python
from transformers import AutoTokenizer
from optimum.executorch import ExecuTorchModelForCausalLM

et_model = ExecuTorchModelForCausalLM.from_pretrained("gemma_output", export=False)
tokenizer = AutoTokenizer.from_pretrained("gemma_phone_model")
prompt = "<start_of_turn>user\nWhat is 2 + 2?<end_of_turn>\n<start_of_turn>model\n"
print(et_model.text_generation(tokenizer, prompt, max_seq_len=50))
```

Notebook-reported artifact sizes:

- Gemma3 270M `.pte`: about `306 MB`
- Qwen3 0.6B `.pte`: about `472 MB`

## 8) Integration Notes For Yaatal Engine

- Keep training/export scripts outside reusable Rust crates (`scripts/` or a separate ML workspace).
- Treat `.pte` artifacts as release assets, not committed source files.
- Add a model manifest (version, hash, tokenizer config, context length) before wiring into `apps/yokk-mobile`.
