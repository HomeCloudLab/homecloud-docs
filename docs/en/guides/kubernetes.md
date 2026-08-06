# Kubernetes

The Kubernetes console lets you **browse and operate workloads** in your account’s namespace on the platform cluster. You do not paste a kubeconfig for normal use — the console talks to the cluster on your behalf.

| Item | Value |
|------|--------|
| Console | **Kubernetes** → `/console/kubernetes` |
| Scope | Your account namespace (`acc-{shortId}` style). Platform admins also see system namespaces, never other tenants’ `acc-*` namespaces |

## What you can do

- List namespaces you are allowed to see  
- Browse **Deployments** and **Pods**  
- Inspect status, restarts, and events  
- Adjust **scaling** / HPA where exposed  
- View and edit **configuration**  
- **Apply YAML** for advanced custom resources (validate before apply)

## Console walkthrough

### Find your workloads

1. Open **Kubernetes**.  
2. Select your account namespace.  
3. Open **Workloads** / Deployments to see replica counts and readiness.

### Pods

Open a deployment → **Pods**:

- See running pods, restarts, node placement  
- Use this when an app is “up” in Applications but traffic fails — verify pods are Ready

### Scaling

Open **Scaling**:

- Set desired replicas  
- Configure or inspect Horizontal Pod Autoscaler when available  
- Use health / metrics / timeline panels when your console version shows them (in-console Info explains each chart)

### Configuration

View environment, mounts, and related settings. Prefer changing Applications **Settings** when the workload was created from an Application template, so you do not drift from the app model.

### Apply YAML

For power users:

1. Paste a manifest.  
2. **Validate**.  
3. **Apply** only when validation succeeds.

Avoid applying changes that fight an operator or Application controller.

## Relation to other services

| Service | Relationship |
|---------|----------------|
| **Applications** | Higher-level deploy; uses Kubernetes under the hood |
| **MDB / Redis** | May show related pods for debugging; manage day-2 via their own consoles |
| **Functions** | Separate runtime; not edited as raw Deployments for normal use |

## Tips and pitfalls

- Account isolation is namespace-based — you will not see other customers’ workloads.  
- Cluster administration (nodes, Traefik, storage classes) is a **platform operator** concern.  
- If Apply fails, read Events on the resource before retrying.  
- Scaling to zero may be limited by platform policy for some workloads.

## Related

- [Applications](applications.md)  
- [Image Registry](registry.md)  
