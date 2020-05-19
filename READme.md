## Profilers
---
### Azure Web App
In case it is not finding the libraries based on the nodejs abi, you can install it in SSH or using install.sh with Oryx.
```
apt-get update
apt-get install build-essential
```

### How to use this app
---

#### High CPU
- To simulate High CPU you can request the following route: **`/cpu/:id`**
- Example: `/cpu/45`

#### High Memory
- To consume memory you can request the following route: **`/memory/:id`**
- Example `/memory/100`
- Or request the following route: **`/memory2`**
- This latest one will consume 200MB in each request.

---
#### Profiling CPU
- To start profiling CPU, you can use the following requests:
**`/profiler/cpu/start/:id`** (id is a random number just for filename)
- You need to start it first and then replicate the issue, this will create a file inside **`/home/site/wwwwroot/profiles/<random-id>.cpuprofile`**
- To stop profiling you need to request the following route: **`/profiler/cpu/stop/:id`** with the same id that you typed first.
- Download the cpuprofile using kudu and use chrome inspect tools.

#### Profiling Memory
- To take a snapshot of the current memory, you can use this request: **`/profiler/memory/start/:id`** (id is a random number just for filename)
- This will create a file inside **`/home/site/wwwwroot/profiles/<random-id>.heapsnapshot`** and also there is another library in this project called heapdump that is not using v8 profiler and it is creating a file inside **`/home/site/wwwwroot/<random-id>.heapsnapshot`** with the same content, just to show that using v8 profiler or heapdump can be the same in memory.

#### Showing current memory and cpu time with NodeJS
- You can request **`/process`** and will see the memory allocation and cpu in microseconds.


>  **Note**: This example reuses code from this blog: https://docs.microsoft.com/en-us/archive/blogs/azureossds/finding-memory-leaks-and-cpu-usage-in-azure-node-js-web-app