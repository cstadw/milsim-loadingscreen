local Config = {
    maxPlayers  = 64,
}

local function BuildPlayerList()
    local players = {}
    for _, src in ipairs(GetPlayers()) do
        local id = tonumber(src)
        table.insert(players, {
            id   = id,
            name = GetPlayerName(id) or ("Spieler #" .. id),
            ping = GetPlayerPing(id) or 0,
            rank = GetPlayerRank(id),
        })
    end
    table.sort(players, function(a, b) return a.ping < b.ping end)
    return players
end

RegisterNetEvent('fx_loadingscreen:requestPlayers')
AddEventHandler('fx_loadingscreen:requestPlayers', function()
    TriggerClientEvent('fx_loadingscreen:receivePlayers', source, BuildPlayerList())
end)
