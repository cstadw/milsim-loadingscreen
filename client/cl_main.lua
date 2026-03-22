local loadStages = {
    { pct = 5,   label = "VERBINDE MIT SERVER..."            },
    { pct = 15,  label = "LADE BASIS-RESSOURCEN..."          },
    { pct = 30,  label = "INITIALISIERE KARTEN & TERRAIN..." },
    { pct = 45,  label = "LADE FAHRZEUGE & WAFFEN..."        },
    { pct = 60,  label = "SYNCHRONISIERE SPIELERDATEN..."    },
    { pct = 75,  label = "KONFIGURIERE MILSIM-SYSTEME..."    },
    { pct = 88,  label = "ÜBERPRÜFE BERECHTIGUNGEN..."       },
    { pct = 95,  label = "FINALISIERE VERBINDUNG..."         },
    { pct = 100, label = "BEREIT — WILLKOMMEN, SOLDAT."      },
}

local function SendToUI(msgType, data)
    data.type = msgType
    SendNUIMessage(data)
end

local function SendLoadProgress()
    for _, stage in ipairs(loadStages) do
        SendToUI('loadProgress', { percent = stage.pct, label = stage.label })
        Wait(math.random(300, 800))
    end
end

local function RequestPlayerList()
    TriggerServerEvent('fx_loadingscreen:requestPlayers')
end

AddEventHandler('fx_loadingscreen:receivePlayers', function(players)
    SendToUI('playerList', { players = players })
end)

AddEventHandler('onClientResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    Citizen.CreateThread(SendLoadProgress)
    Citizen.CreateThread(function()
        while true do
            RequestPlayerList()
            Wait(5000)
        end
    end)
end)

AddEventHandler('playerSpawned', function()
    Wait(1500)
    ShutdownLoadingScreenNui()
end)
